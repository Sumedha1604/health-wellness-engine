const db = require("../config/db");

async function createRecommendationFeedback(userId, feedback) {

    const {
        recommendation_type,
        recommendation_id,
        feedback: response,
    } = feedback;

    const [result] = await db.execute(
        `
        INSERT INTO recommendation_feedback (
            user_id,
            recommendation_type,
            recommendation_id,
            feedback
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            recommendation_type,
            recommendation_id,
            response,
        ]
    );

    return {
        id: result.insertId,
    };
}

async function getRecommendationFeedback(userId) {

    const [rows] = await db.execute(
        `
        SELECT
            id,
            recommendation_type,
            recommendation_id,
            feedback,
            created_at
        FROM recommendation_feedback
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return rows;
}

module.exports = {
    createRecommendationFeedback,
    getRecommendationFeedback,
};
