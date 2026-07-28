const db = require("../config/db");


async function recordRecommendationEvent(
    userId,
    recommendationId,
    eventType,
    recommendationType = "exercise"
) {

    const [result] = await db.execute(
        `
        INSERT INTO recommendation_events (
            user_id,
            recommendation_id,
            recommendation_type,
            event_type
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            recommendationId,
            recommendationType,
            eventType,
        ]
    );

    return {
        id: result.insertId,
    };
}


module.exports = {
    recordRecommendationEvent,
};
