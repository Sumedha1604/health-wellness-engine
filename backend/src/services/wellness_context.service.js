const db = require("../config/db");
const recommendationService = require("./recommendation.service");

async function getRecommendations(userId) {

    try {

        const recommendations =
            await recommendationService.generateRecommendations(userId);

        return {
            exercises: recommendations.recommended_exercises || [],
            foods: recommendations.recommended_foods || [],
        };

    } catch (error) {

        console.warn("Wellness recommendation context unavailable.");

        return {
            exercises: [],
            foods: [],
        };

    }
}

async function buildUserContext(userId) {

    const [
        [userRows],
        [preferencesRows],
        [nutritionRows],
        [waterRows],
        [exerciseRows],
        [chatHistoryRows],
        recommendations,
    ] = await Promise.all([
        db.execute(
            `
            SELECT
                CONCAT(first_name, ' ', last_name) AS name,
                email
            FROM users
            WHERE user_id = ?
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT
                fitness_goal,
                activity_level,
                diet_type
            FROM preferences
            WHERE user_id = ?
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT
                COALESCE(SUM(f.caloric_value * nl.quantity), 0) AS calories,
                COALESCE(SUM(f.protein * nl.quantity), 0) AS protein,
                COALESCE(SUM(f.carbohydrates * nl.quantity), 0) AS carbs,
                COALESCE(SUM(f.fat * nl.quantity), 0) AS fat
            FROM nutrition_logs nl
            INNER JOIN foods f
                ON nl.food_id = f.food_id
            WHERE
                nl.user_id = ?
                AND DATE(nl.logged_at) = CURDATE()
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT COALESCE(SUM(amount_ml), 0) AS consumed
            FROM water_logs
            WHERE
                user_id = ?
                AND DATE(logged_at) = CURDATE()
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT
                e.title,
                el.duration_minutes,
                el.calories_burned
            FROM exercise_logs el
            INNER JOIN exercises e
                ON el.exercise_id = e.exercise_id
            WHERE
                el.user_id = ?
                AND DATE(el.completed_at) = CURDATE()
            ORDER BY el.completed_at DESC
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT
                message,
                response,
                created_at
            FROM chat_history
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 5
            `,
            [userId]
        ),
        getRecommendations(userId),
    ]);

    return {
        user: userRows[0] || null,
        preferences: preferencesRows[0] || null,
        nutrition: {
            calories: Number(nutritionRows[0].calories),
            protein: Number(nutritionRows[0].protein),
            carbs: Number(nutritionRows[0].carbs),
            fat: Number(nutritionRows[0].fat),
        },
        water: {
            consumed: Number(waterRows[0].consumed),
            goal: 2500,
        },
        exercises: exerciseRows,
        conversationHistory: chatHistoryRows.reverse(),
        recommendations,
    };
}

module.exports = {
    buildUserContext,
};
