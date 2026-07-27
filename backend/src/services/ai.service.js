const axios = require("axios");
const db = require("../config/db");

async function buildUserContext(userId) {

    const [
        [preferencesRows],
        [nutritionRows],
        [waterRows],
        [exerciseRows],
    ] = await Promise.all([
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
    ]);

    return {
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
    };
}

function buildFallbackResponse(context) {

    const goal = context.preferences?.fitness_goal || "wellness";
    const activity = context.preferences?.activity_level || "your current activity level";
    const waterRemaining = Math.max(
        0,
        context.water.goal - context.water.consumed
    );

    const exerciseMessage = context.exercises.length > 0
        ? `You have completed ${context.exercises.length} workout${
            context.exercises.length === 1 ? "" : "s"
        } today.`
        : "A short workout or walk would be a great way to add movement today.";

    return `For your ${goal} goal and ${activity} activity level, focus on one sustainable step at a time. ${exerciseMessage} You have logged ${Math.round(context.nutrition.protein)} g of protein and ${Math.round(context.nutrition.calories)} calories today. ${waterRemaining > 0 ? `Try to drink another ${waterRemaining} ml of water to reach your daily goal.` : "You have reached your daily water goal—great work!"}`;
}

async function generateResponse(message, context) {

    if (!process.env.AI_API_KEY) {
        return buildFallbackResponse(context);
    }

    try {

        const response = await axios.post(
            process.env.AI_API_URL ||
                "https://api.openai.com/v1/chat/completions",
            {
                model: process.env.AI_MODEL || "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a supportive wellness assistant. Give practical, concise guidance based only on the provided user context. Do not diagnose medical conditions.",
                    },
                    {
                        role: "user",
                        content: `User context: ${JSON.stringify(context)}\n\nQuestion: ${message}`,
                    },
                ],
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.AI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const reply = response.data?.choices?.[0]?.message?.content;

        return reply || buildFallbackResponse(context);

    } catch (error) {

        console.error("AI provider unavailable", error.message);

        return buildFallbackResponse(context);

    }
}

async function saveConversation(userId, message, response) {

    await db.execute(
        `
        INSERT INTO chat_history (
            user_id,
            message,
            response
        )
        VALUES (?, ?, ?)
        `,
        [userId, message, response]
    );
}

module.exports = {
    buildUserContext,
    generateResponse,
    saveConversation,
};
