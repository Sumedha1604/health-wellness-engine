const axios = require("axios");
const db = require("../config/db");
const wellnessContextService = require("./wellness_context.service");

const CHAT_HISTORY_LIMIT = 10;

async function buildUserContext(userId) {

    const conversationHistory = await getConversationHistory(userId);

    return wellnessContextService.buildUserContext(
        userId,
        conversationHistory
    );
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

function buildSystemPrompt(context) {

    return `You are a personalized wellness assistant.

Rules:
- Give friendly, actionable fitness, nutrition, hydration, and wellness guidance.
- Use the user's provided data when it is relevant to the question.
- Never invent user information or claim progress that is not in the context.
- Ask a brief clarifying question when the context or request is insufficient.
- For workout suggestions, use the user's goal, activity level, completed workouts, and recommended exercises.
- For nutrition and hydration questions, use today's logged totals and goals.
- Do not diagnose medical conditions; recommend qualified professional help for medical concerns.

Current user context:
${JSON.stringify(context)}`;

}

function buildChatMessages(message, context) {

    const conversationHistory = context?.conversationHistory || [];
    const historyMessages = conversationHistory.flatMap((conversation) => {

        if (conversation.role) {
            return [{
                role: conversation.role,
                content: conversation.message,
            }];
        }

        // Support pre-normalization rows while the database migration is rolled
        // out, without sending a malformed history to Groq.
        return [
            {
                role: "user",
                content: conversation.message,
            },
            {
                role: "assistant",
                content: conversation.response,
            },
        ];
    });

    return [
        {
            role: "system",
            content: buildSystemPrompt(context),
        },
        ...historyMessages,
        {
            role: "user",
            content: message,
        },
    ];

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
            messages: buildChatMessages(message, context),
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

async function saveMessage(userId, role, message) {

    const [result] = await db.execute(
        `
        INSERT INTO chat_history (
            user_id,
            role,
            message
        )
        VALUES (?, ?, ?)
        `,
        [userId, role, message]
    );

    return {
        id: result.insertId,
    };
}

async function getConversationHistory(userId, limit = CHAT_HISTORY_LIMIT) {

    const safeLimit = Math.min(
        Math.max(Number.parseInt(limit, 10) || CHAT_HISTORY_LIMIT, 1),
        CHAT_HISTORY_LIMIT
    );

    const [rows] = await db.execute(
        `
        SELECT
            role,
            message,
            created_at
        FROM chat_history
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ${safeLimit}
        `,
        [userId]
    );

    return rows.reverse();
}

async function saveConversation(userId, message, response) {

    await saveMessage(userId, "user", message);

    return saveMessage(userId, "assistant", response);
}

module.exports = {
    buildUserContext,
    buildChatMessages,
    generateResponse,
    getConversationHistory,
    saveMessage,
    saveConversation,
};
