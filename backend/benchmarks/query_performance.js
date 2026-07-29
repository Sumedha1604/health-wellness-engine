/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const RUNS = positiveInteger(process.env.BENCHMARK_RUNS, 40);
const WARMUPS = positiveInteger(process.env.BENCHMARK_WARMUP_RUNS, 5);
const APPLY_INDEXES = process.argv.includes("--apply-indexes");
const REPORT_PATH = path.resolve(
    __dirname,
    process.env.BENCHMARK_REPORT || "database_performance_report.md"
);

const INDEXES = [
    ["meal_plans", "idx_meal_plans_user_date_id", "`user_id`, `meal_date`, `meal_plan_id`"],
    ["foods", "idx_foods_name", "`food_name`"],
    ["exercises", "idx_exercises_filters_title", "`body_part`, `equipment`, `difficulty_level`, `title`"],
    ["recommendations", "idx_recommendations_user_recommended_id", "`user_id`, `recommended_at`, `recommendation_id`"],
    ["recommendation_feedback", "idx_recommendation_feedback_user_created_id", "`user_id`, `created_at`, `id`"],
];

function positiveInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function hint(name, installed, phase) {
    if (!installed.has(name)) return "";
    return phase === "before"
        ? `IGNORE INDEX (\`${name}\`)`
        : `FORCE INDEX (\`${name}\`)`;
}

async function getInstalledIndexes(connection) {
    const [rows] = await connection.execute(
        `SELECT DISTINCT index_name FROM information_schema.statistics
         WHERE table_schema = DATABASE()`
    );
    return new Set(rows.map((row) => row.index_name || row.INDEX_NAME));
}

async function applyIndexes(connection, installed) {
    for (const [table, name, columns] of INDEXES) {
        if (!installed.has(name)) {
            await connection.query(
                `CREATE INDEX \`${name}\` ON \`${table}\` (${columns})`
            );
            console.log(`Created ${name} on ${table}.`);
        }
    }
}

async function representativeValues(connection) {
    async function busiest(table) {
        const [[row]] = await connection.query(
            `SELECT user_id FROM \`${table}\` GROUP BY user_id
             ORDER BY COUNT(*) DESC LIMIT 1`
        );
        return row?.user_id || 1;
    }
    async function firstTerm(table, id, column) {
        const [[row]] = await connection.query(
            `SELECT LEFT(\`${column}\`, 3) term FROM \`${table}\`
             WHERE CHAR_LENGTH(\`${column}\`) >= 3 ORDER BY \`${id}\` LIMIT 1`
        );
        return row?.term || "fit";
    }
    const override = process.env.BENCHMARK_USER_ID;
    const [[exerciseFilters]] = await connection.query(
        `SELECT body_part, equipment, difficulty_level
         FROM exercises
         WHERE body_part IS NOT NULL AND equipment IS NOT NULL
           AND difficulty_level IS NOT NULL
         GROUP BY body_part, equipment, difficulty_level
         ORDER BY COUNT(*) DESC LIMIT 1`
    );
    return {
        mealUserId: Number(override || await busiest("meal_plans")),
        recommendationUserId: Number(override || await busiest("recommendation_feedback")),
        historyUserId: Number(override || await busiest("nutrition_logs")),
        foodTerm: process.env.BENCHMARK_FOOD_TERM
            || await firstTerm("foods", "food_id", "food_name"),
        bodyPart: exerciseFilters?.body_part,
        equipment: exerciseFilters?.equipment,
        difficulty: exerciseFilters?.difficulty_level,
    };
}

function benchmarks(values, installed, phase) {
    return [
        {
            name: "Dashboard data query",
            sql: `SELECT mp.meal_plan_id, mp.meal_type, mp.quantity, mp.meal_date,
                         f.food_name, f.caloric_value
                  FROM meal_plans mp ${hint("idx_meal_plans_user_date_id", installed, phase)}
                  INNER JOIN foods f ON f.food_id = mp.food_id
                  WHERE mp.user_id = ?
                  ORDER BY mp.meal_date DESC, mp.meal_plan_id DESC LIMIT 20`,
            params: [values.mealUserId],
        },
        {
            name: "Food search query",
            sql: `SELECT food_id, food_name, caloric_value, protein, carbohydrates, fat
                  FROM foods ${hint("idx_foods_name", installed, phase)}
                  WHERE food_name LIKE ? ORDER BY food_name LIMIT 20`,
            params: [`%${values.foodTerm}%`],
        },
        {
            name: "Exercise search query",
            sql: `SELECT exercise_id, title, exercise_type, body_part, equipment,
                         difficulty_level, rating
                  FROM exercises ${hint("idx_exercises_filters_title", installed, phase)}
                  WHERE body_part = ? AND equipment = ? AND difficulty_level = ?
                  ORDER BY title LIMIT 20`,
            params: [values.bodyPart, values.equipment, values.difficulty],
        },
        {
            name: "Recommendation retrieval query",
            sql: `SELECT id, recommendation_type, recommendation_id, feedback,
                         recommendation_score, viewed, created_at
                  FROM recommendation_feedback
                  ${hint("idx_recommendation_feedback_user_created_id", installed, phase)}
                  WHERE user_id = ? ORDER BY created_at DESC, id DESC`,
            params: [values.recommendationUserId],
        },
        {
            name: "Tracking history query",
            sql: `SELECT nl.id, nl.food_id, nl.quantity, nl.logged_at, f.food_name,
                         f.caloric_value, (f.caloric_value * nl.quantity) AS calories
                  FROM nutrition_logs nl INNER JOIN foods f ON f.food_id = nl.food_id
                  WHERE nl.user_id = ?
                    AND nl.logged_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                    AND nl.logged_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
                  ORDER BY nl.logged_at DESC`,
            params: [values.historyUserId],
        },
    ];
}

async function measure(connection, item) {
    for (let run = 0; run < WARMUPS; run += 1) {
        await connection.execute(item.sql, item.params);
    }
    const samples = [];
    let rowsReturned = 0;
    for (let run = 0; run < RUNS; run += 1) {
        const start = process.hrtime.bigint();
        const [rows] = await connection.execute(item.sql, item.params);
        samples.push(Number(process.hrtime.bigint() - start) / 1e6);
        rowsReturned = rows.length;
    }
    samples.sort((a, b) => a - b);
    return { milliseconds: samples[Math.floor(samples.length / 2)], rowsReturned };
}

async function runPhase(connection, values, installed, phase) {
    const output = [];
    for (const item of benchmarks(values, installed, phase)) {
        output.push({ name: item.name, result: await measure(connection, item) });
    }
    return output;
}

function report(before, after) {
    const lines = [
        "Database Performance Report",
        "---------------------------",
        `Median of ${RUNS} runs after ${WARMUPS} warm-up runs.`,
        "",
    ];
    before.forEach((item, index) => {
        const optimized = after[index];
        const improvement = ((item.result.milliseconds - optimized.result.milliseconds)
            / item.result.milliseconds) * 100;
        lines.push(
            `Query: ${item.name}`,
            `Before: ${item.result.milliseconds.toFixed(3)} ms, ${item.result.rowsReturned} rows returned`,
            `After: ${optimized.result.milliseconds.toFixed(3)} ms, ${optimized.result.rowsReturned} rows returned`,
            `Improvement: ${improvement.toFixed(2)}%`,
            ""
        );
    });
    return `${lines.join("\n")}\n`;
}

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    try {
        let installed = await getInstalledIndexes(connection);
        const values = await representativeValues(connection);
        const before = await runPhase(connection, values, installed, "before");
        if (APPLY_INDEXES) {
            await applyIndexes(connection, installed);
            installed = await getInstalledIndexes(connection);
        }
        const missing = INDEXES.filter(([, name]) => !installed.has(name));
        if (missing.length) {
            throw new Error(
                `Missing indexes: ${missing.map(([, name]) => name).join(", ")}. `
                + "Run with --apply-indexes or apply the migration."
            );
        }
        const after = await runPhase(connection, values, installed, "after");
        const output = report(before, after);
        fs.writeFileSync(REPORT_PATH, output);
        console.log(`\n${output}Report written to ${REPORT_PATH}`);
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error(`Benchmark failed: ${error.message}`);
    process.exitCode = 1;
});
