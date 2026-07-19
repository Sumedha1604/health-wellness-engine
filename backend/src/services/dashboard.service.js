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

async function getRecentMeals(userId) {

    const [rows] = await db.execute(
        `
        SELECT
            mp.meal_plan_id,
            mp.meal_type,
            mp.quantity,
            mp.meal_date,
            f.food_name,
            f.caloric_value
        FROM meal_plans mp
        INNER JOIN foods f
            ON mp.food_id = f.food_id
        WHERE mp.user_id = ?
        ORDER BY mp.meal_date DESC, mp.meal_plan_id DESC
        LIMIT 5
        `,
        [userId]
    );

    return rows;

}

async function getWeeklyCalories(userId) {

    const [rows] = await db.execute(
        `
        SELECT
            DATE(mp.meal_date) AS meal_date,
            SUM(f.caloric_value * mp.quantity) AS calories
        FROM meal_plans mp
        INNER JOIN foods f
            ON mp.food_id = f.food_id
        WHERE
            mp.user_id = ?
            AND mp.meal_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(mp.meal_date)
        ORDER BY meal_date
        `,
        [userId]
    );

    const caloriesMap = {};

    rows.forEach((row) => {
        const date = new Date(row.meal_date).toISOString().split("T")[0];
        caloriesMap[date] = Number(row.calories);
    });

    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const dateString = date.toISOString().split("T")[0];

        weeklyData.push({
            day: date.toLocaleDateString("en-US", {
                weekday: "short",
            }),
            calories: caloriesMap[dateString] || 0,
        });
    }

    return weeklyData;

}

module.exports = {
    getDashboard,
    getTodaySummary,
    getRecentMeals,
    getWeeklyCalories,
};