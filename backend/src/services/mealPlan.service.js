const db = require("../config/db");

async function createMealPlan(userId, meal) {
    const {
        food_id,
        meal_type,
        meal_date,
        quantity,
    } = meal;

    await db.execute(
        `
        INSERT INTO meal_plans (
            user_id,
            food_id,
            meal_type,
            meal_date,
            quantity
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            userId,
            food_id,
            meal_type,
            meal_date,
            quantity,
        ]
    );
}

async function getMealPlans(userId) {

    const [rows] = await db.execute(
        `
        SELECT
            mp.meal_plan_id,
            mp.meal_date,
            mp.meal_type,
            mp.quantity,
            f.food_id,
            f.food_name,
            f.caloric_value,
            f.protein,
            f.carbohydrates,
            f.fat
        FROM meal_plans mp
        INNER JOIN foods f
            ON mp.food_id = f.food_id
        WHERE mp.user_id = ?
        ORDER BY mp.meal_date DESC,
                 mp.meal_type ASC
        `,
        [userId]
    );

    return rows;
}

async function getMealPlanById(userId, mealPlanId) {

    const [rows] = await db.execute(
        `
        SELECT
            mp.meal_plan_id,
            mp.meal_date,
            mp.meal_type,
            mp.quantity,
            f.food_id,
            f.food_name,
            f.caloric_value,
            f.protein,
            f.carbohydrates,
            f.fat
        FROM meal_plans mp
        INNER JOIN foods f
            ON mp.food_id = f.food_id
        WHERE
            mp.meal_plan_id = ?
            AND mp.user_id = ?
        `,
        [
            mealPlanId,
            userId,
        ]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}

async function updateMealPlan(userId, mealPlanId, meal) {

    const {
        food_id,
        meal_type,
        meal_date,
        quantity,
    } = meal;

    const [result] = await db.execute(
        `
        UPDATE meal_plans
        SET
            food_id = ?,
            meal_type = ?,
            meal_date = ?,
            quantity = ?
        WHERE
            meal_plan_id = ?
            AND user_id = ?
        `,
        [
            food_id,
            meal_type,
            meal_date,
            quantity,
            mealPlanId,
            userId,
        ]
    );

    return result.affectedRows > 0;
}

async function deleteMealPlan(userId, mealPlanId) {

    const [result] = await db.execute(
        `
        DELETE FROM meal_plans
        WHERE
            meal_plan_id = ?
            AND user_id = ?
        `,
        [
            mealPlanId,
            userId,
        ]
    );

    return result.affectedRows > 0;
}

module.exports = {
    createMealPlan,
    getMealPlans,
    getMealPlanById,
    updateMealPlan,
    deleteMealPlan,
};