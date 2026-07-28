const db = require("../config/db");
const recommendationEventService =
    require("./recommendation_event.service");

function getRecommendationScore(feedback) {

    if (feedback === "like") {
        return 1;
    }

    if (feedback === "dislike") {
        return -1;
    }

    return 0;
}

async function createRecommendationFeedback(userId, feedback) {

    const {
        recommendation_type,
        recommendation_id,
        feedback: response,
    } = feedback;
    const recommendationScore = getRecommendationScore(response);

    const [result] = await db.execute(
        `
        INSERT INTO recommendation_feedback (
            user_id,
            recommendation_type,
            recommendation_id,
            feedback,
            recommendation_score,
            viewed
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            recommendation_type,
            recommendation_id,
            response,
            recommendationScore,
            true,
        ]
    );

    const eventType = {
        like: "accept",
        dislike: "reject",
        viewed: "view",
    }[response];

    await recommendationEventService.recordRecommendationEvent(
        userId,
        recommendation_id,
        eventType,
        recommendation_type
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
            recommendation_score,
            viewed,
            created_at
        FROM recommendation_feedback
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        `,
        [userId]
    );

    return rows.map((row) => ({
        ...row,
        recommendation_score: Number(row.recommendation_score),
        viewed: Boolean(row.viewed),
    }));
}

async function getFeedbackInfluence(userId, recommendationType) {

    try {

        const [rows] = await db.execute(
            `
            SELECT
                recommendation_id,
                SUM(recommendation_score) AS score
            FROM recommendation_feedback
            WHERE
                user_id = ?
                AND recommendation_type = ?
            GROUP BY recommendation_id
            `,
            [userId, recommendationType]
        );

        return rows.reduce((influence, row) => {
            influence[row.recommendation_id] = Number(row.score);

            return influence;
        }, {});

    } catch (error) {

        return {};

    }
}

module.exports = {
    createRecommendationFeedback,
    getRecommendationFeedback,
    getFeedbackInfluence,
};
