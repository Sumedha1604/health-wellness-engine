const db = require("../config/db");
const recommendationEventService =
    require("./recommendation_event.service");


async function saveRecommendationInteraction(userId, interaction) {

    const {
        exercise_id,
        action,
        rating,
    } = interaction;

    const [[exercise]] = await db.execute(
        `
        SELECT exercise_id
        FROM exercises
        WHERE exercise_id = ?
        LIMIT 1
        `,
        [exercise_id]
    );

    if (!exercise) {
        const error = new Error("Exercise not found");

        error.statusCode = 404;

        throw error;
    }

    const completed = action === "COMPLETED";
    const [result] = await db.execute(
        `
        INSERT INTO recommendation_interactions (
            user_id,
            exercise_id,
            action,
            rating,
            completed
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            userId,
            exercise_id,
            action,
            rating ?? null,
            completed,
        ]
    );

    const eventType = getEventType(action, rating);

    if (eventType) {
        await recommendationEventService.recordRecommendationEvent(
            userId,
            exercise_id,
            eventType
        );
    }

    return {
        id: result.insertId,
    };
}


function getEventType(action, rating) {

    const eventTypes = {
        VIEWED: "view",
        COMPLETED: "accept",
        FAVORITED: "favourite",
        SKIPPED: "reject",
    };

    if (eventTypes[action]) {
        return eventTypes[action];
    }

    if (action === "RATED" && rating >= 4) {
        return "accept";
    }

    if (action === "RATED" && rating <= 2) {
        return "reject";
    }

    return null;
}


async function getUserInteractionHistory(userId) {

    const [rows] = await db.execute(
        `
        SELECT
            id,
            exercise_id,
            action,
            rating,
            completed,
            created_at
        FROM recommendation_interactions
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        `,
        [userId]
    );

    return rows.map((row) => ({
        ...row,
        rating: row.rating === null ? null : Number(row.rating),
        completed: Boolean(row.completed),
    }));
}


async function getInteractionDataset() {

    const [rows] = await db.execute(
        `
        SELECT
            user_id,
            exercise_id,
            action,
            rating,
            created_at AS timestamp
        FROM recommendation_interactions
        ORDER BY created_at ASC, id ASC
        `
    );

    return rows.map((row) => ({
        ...row,
        rating: row.rating === null ? null : Number(row.rating),
    }));
}


module.exports = {
    saveRecommendationInteraction,
    getUserInteractionHistory,
    getInteractionDataset,
};
