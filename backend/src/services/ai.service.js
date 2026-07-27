const axios = require("axios");
const db = require("../config/db");

async function buildUserContext(userId) {

    const [
        [userRows],
        [preferencesRows],
        [nutritionRows],
        [waterRows],
        [exerciseRows],
        [chatHistoryRows],
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
    };
}

function buildSimpleResponse(message) {

    const normalizedMessage = message.toLowerCase().trim();

    if (
        /^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/.test(
            normalizedMessage
        )
    ) {
        return "Hi! How can I help you with your fitness or wellness today?";
    }

    if (/^(help|help me)[!. ]*$/.test(normalizedMessage)) {
        return "I can help you with fitness goals, nutrition advice, hydration tracking, workout suggestions, and understanding your wellness progress.";
    }

    if (
        /thanks|thank you|thx/.test(
            normalizedMessage
        )
    ) {
        return "You’re welcome! Let me know whenever you’d like help with your wellness routine.";
    }

    return null;
}

function buildFallbackResponse() {

    return "I’m unable to reach the AI assistant right now. Please try again shortly.";
}

async function generateResponse(message, context) {

    const simpleResponse = buildSimpleResponse(message);
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const apiUrl = process.env.GROQ_API_URL ||
        "https://api.groq.com/openai/v1/chat/completions";

    if (simpleResponse) {
        return simpleResponse;
    }

    if (!apiKey) {
        console.warn("AI fallback used: GROQ_API_KEY is not configured.", {
            groqApiUrlConfigured: Boolean(process.env.GROQ_API_URL),
            groqModelConfigured: Boolean(process.env.GROQ_MODEL),
        });

        return buildFallbackResponse();
    }

    try {

        const requestBody = {
            model,
            messages: [
                {
                    role: "user",
                    content: `You are a friendly, conversational wellness assistant. Respond naturally to greetings and casual questions before offering wellness guidance. Use the provided wellness context when it helps answer the user's question, but do not repeat a full wellness summary unless the user asks for it. Give practical, concise guidance and do not diagnose medical conditions.\n\nUser context: ${JSON.stringify(context)}\n\nQuestion: ${message}`,
                },
            ],
            temperature: 0.7,
        };

        console.info("Groq request sent.", {
            apiUrl,
            model,
            apiKeyConfigured: Boolean(apiKey),
            authorizationScheme: "Bearer",
            messageCount: requestBody.messages.length,
        });

        const response = await axios.post(
            apiUrl,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const reply = response.data?.choices?.[0]?.message?.content?.trim();

        if (reply) {
            return reply;
        }

        console.warn("AI fallback used: Groq returned an empty response.", {
            status: response.status,
            apiUrl,
            model,
        });

        return buildFallbackResponse();

    } catch (error) {

        console.error("Groq request failed.", {
            errorMessage: error.message,
            status: error.response?.status || null,
            statusText: error.response?.statusText || null,
            responseData: error.response?.data || null,
            code: error.code || null,
            apiUrl,
            model,
            apiKeyConfigured: Boolean(apiKey),
        });

        console.warn("AI fallback used: Groq request failed.");

        return buildFallbackResponse();

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
