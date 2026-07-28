const db = require("../config/db");

const HISTORY_PERIODS = {
    today: {
        start: "CURDATE()",
        end: "DATE_ADD(CURDATE(), INTERVAL 1 DAY)",
    },
    last7days: {
        start: "DATE_SUB(CURDATE(), INTERVAL 6 DAY)",
        end: "DATE_ADD(CURDATE(), INTERVAL 1 DAY)",
    },
    last30days: {
        start: "DATE_SUB(CURDATE(), INTERVAL 29 DAY)",
        end: "DATE_ADD(CURDATE(), INTERVAL 1 DAY)",
    },
};

function getPeriodSql(period) {

    return HISTORY_PERIODS[period] || HISTORY_PERIODS.today;
}

async function getUserHistory(userId, period = "today") {

    const selectedPeriod = period || "today";
    const { start, end } = getPeriodSql(selectedPeriod);
    const [
        nutritionResult,
        exerciseResult,
        waterResult,
        workoutPlanResult,
    ] = await Promise.all([
        db.execute(
            `
            SELECT
                nl.id,
                nl.food_id,
                nl.quantity,
                nl.logged_at,
                f.food_name,
                f.caloric_value,
                f.protein,
                f.carbohydrates,
                f.fat,
                (f.caloric_value * nl.quantity) AS calories
            FROM nutrition_logs nl
            INNER JOIN foods f ON f.food_id = nl.food_id
            WHERE nl.user_id = ?
                AND nl.logged_at >= ${start}
                AND nl.logged_at < ${end}
            ORDER BY nl.logged_at DESC
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT
                el.id,
                el.exercise_id,
                el.duration_minutes,
                el.calories_burned,
                el.completed_at,
                e.title,
                e.body_part,
                e.equipment,
                e.difficulty_level
            FROM exercise_logs el
            INNER JOIN exercises e ON e.exercise_id = el.exercise_id
            WHERE el.user_id = ?
                AND el.completed_at >= ${start}
                AND el.completed_at < ${end}
            ORDER BY el.completed_at DESC
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT id, amount_ml, logged_at
            FROM water_logs
            WHERE user_id = ?
                AND logged_at >= ${start}
                AND logged_at < ${end}
            ORDER BY logged_at DESC
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT
                wp.id,
                wp.title,
                wp.goal,
                wp.duration_weeks,
                wp.created_at,
                wp.completed_at,
                COUNT(wpe.id) AS exercise_count
            FROM workout_plans wp
            LEFT JOIN workout_plan_exercises wpe
                ON wpe.workout_plan_id = wp.id
            WHERE wp.user_id = ?
                AND wp.created_at >= ${start}
                AND wp.created_at < ${end}
            GROUP BY wp.id
            ORDER BY wp.created_at DESC
            `,
            [userId]
        ),
    ]);

    return {
        period: selectedPeriod,
        nutrition: nutritionResult[0].map((log) => ({
            ...log,
            quantity: Number(log.quantity),
            caloric_value: Number(log.caloric_value),
            protein: Number(log.protein),
            carbohydrates: Number(log.carbohydrates),
            fat: Number(log.fat),
            calories: Number(log.calories),
        })),
        exercises: exerciseResult[0].map((log) => ({
            ...log,
            calories_burned: Number(log.calories_burned),
        })),
        water: waterResult[0].map((log) => ({
            ...log,
            amount_ml: Number(log.amount_ml),
        })),
        workout_plans: workoutPlanResult[0].map((plan) => ({
            ...plan,
            duration_weeks: Number(plan.duration_weeks),
            exercise_count: Number(plan.exercise_count),
        })),
    };
}

module.exports = {
    HISTORY_PERIODS,
    getUserHistory,
};
