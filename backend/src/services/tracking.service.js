const db = require("../config/db");

const DAILY_WATER_GOAL = 2500;

async function logExercise(userId, exercise) {

    const {
        exercise_id,
        duration_minutes,
        calories_burned,
    } = exercise;

    const [result] = await db.execute(
        `
        INSERT INTO exercise_logs (
            user_id,
            exercise_id,
            duration_minutes,
            calories_burned
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            exercise_id,
            duration_minutes,
            calories_burned,
        ]
    );

    return {
        id: result.insertId,
    };
}

async function getTodayExerciseLogs(userId) {

    const [rows] = await db.execute(
        `
        SELECT
            el.id,
            el.exercise_id,
            el.duration_minutes,
            el.calories_burned,
            el.completed_at,
            e.title
        FROM exercise_logs el
        INNER JOIN exercises e
            ON el.exercise_id = e.exercise_id
        WHERE
            el.user_id = ?
            AND DATE(el.completed_at) = CURDATE()
        ORDER BY el.completed_at DESC
        `,
        [userId]
    );

    return rows;
}

async function logWater(userId, amountMl) {

    const [result] = await db.execute(
        `
        INSERT INTO water_logs (
            user_id,
            amount_ml
        )
        VALUES (?, ?)
        `,
        [userId, amountMl]
    );

    return {
        id: result.insertId,
    };
}

async function getTodayWater(userId) {

    const [[result]] = await db.execute(
        `
        SELECT COALESCE(SUM(amount_ml), 0) AS consumed
        FROM water_logs
        WHERE
            user_id = ?
            AND DATE(logged_at) = CURDATE()
        `,
        [userId]
    );

    const consumed = Number(result.consumed);

    return {
        consumed,
        goal: DAILY_WATER_GOAL,
        percentage: Math.round(
            (consumed / DAILY_WATER_GOAL) * 100
        ),
    };
}

async function logNutrition(userId, nutrition) {

    const {
        food_id,
        quantity,
    } = nutrition;

    const [result] = await db.execute(
        `
        INSERT INTO nutrition_logs (
            user_id,
            food_id,
            quantity
        )
        VALUES (?, ?, ?)
        `,
        [
            userId,
            food_id,
            quantity,
        ]
    );

    return {
        id: result.insertId,
    };
}

async function getTodayNutritionLogs(userId) {

    const [rows] = await db.execute(
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
            'nutrition_log' AS source
        FROM nutrition_logs nl
        INNER JOIN foods f
            ON nl.food_id = f.food_id
        WHERE
            nl.user_id = ?
            AND DATE(nl.logged_at) = CURDATE()

        UNION ALL

        SELECT
            mp.meal_plan_id AS id,
            mp.food_id,
            mp.quantity,
            CAST(mp.meal_date AS DATETIME) AS logged_at,
            f.food_name,
            f.caloric_value,
            f.protein,
            f.carbohydrates,
            f.fat,
            'meal_plan' AS source
        FROM meal_plans mp
        INNER JOIN foods f
            ON mp.food_id = f.food_id
        WHERE
            mp.user_id = ?
            AND mp.meal_date = CURDATE()
        ORDER BY logged_at DESC, id DESC
        `,
        [userId, userId]
    );

    return rows;
}

module.exports = {
    logExercise,
    getTodayExerciseLogs,
    logWater,
    getTodayWater,
    logNutrition,
    getTodayNutritionLogs,
};
