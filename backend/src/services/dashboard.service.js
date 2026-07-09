const db = require("../config/db");

async function getDashboard(userId) {

    const [[user]] = await db.execute(
        `
        SELECT
            user_id,
            first_name,
            last_name,
            email
        FROM users
        WHERE user_id = ?
        `,
        [userId]
    );

    const [[preferences]] = await db.execute(
        `
        SELECT
            fitness_goal,
            activity_level,
            diet_type,
            height_cm,
            weight_kg
        FROM preferences
        WHERE user_id = ?
        `,
        [userId]
    );

    return {
        user,
        preferences,
    };
}

async function getTodaySummary(userId) {

    const [rows] = await db.execute(
        `
        SELECT
            mp.meal_type,
            mp.quantity,
            f.food_name,
            f.caloric_value,
            f.protein,
            f.carbohydrates,
            f.fat
        FROM meal_plans mp
        INNER JOIN foods f
            ON mp.food_id = f.food_id
        WHERE
            mp.user_id = ?
            AND mp.meal_date = CURDATE()
        `,
        [userId]
    );

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbohydrates = 0;
    let totalFat = 0;

    for (const meal of rows) {
        totalCalories += Number(meal.caloric_value) * meal.quantity;
        totalProtein += Number(meal.protein) * meal.quantity;
        totalCarbohydrates += Number(meal.carbohydrates) * meal.quantity;
        totalFat += Number(meal.fat) * meal.quantity;
    }

    return {
        date: new Date().toISOString().split("T")[0],
        meal_count: rows.length,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbohydrates: totalCarbohydrates,
        total_fat: totalFat,
        meals: rows,
    };
}

module.exports = {
    getDashboard,
    getTodaySummary,
};