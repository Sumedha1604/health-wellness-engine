const db = require("../config/db");


async function getRecommendationAnalytics(userId) {

    const [[summary]] = await db.execute(
        `
        SELECT
            COALESCE(SUM(event_type = 'view'), 0) AS total_recommendations_viewed,
            COALESCE(SUM(event_type = 'accept'), 0) AS accepted_recommendations,
            COALESCE(SUM(event_type = 'reject'), 0) AS rejected_recommendations,
            COALESCE(SUM(event_type = 'favourite'), 0) AS favourite_recommendations
        FROM recommendation_events
        WHERE user_id = ?
        `,
        [userId]
    );

    const [categories] = await db.execute(
        `
        SELECT
            exercises.body_part AS category,
            COUNT(*) AS recommendation_count
        FROM recommendation_events
        INNER JOIN exercises
            ON exercises.exercise_id = recommendation_events.recommendation_id
        WHERE
            recommendation_events.user_id = ?
            AND recommendation_events.recommendation_type = 'exercise'
        GROUP BY exercises.body_part
        ORDER BY recommendation_count DESC, category ASC
        LIMIT 5
        `,
        [userId]
    );

    const [history] = await db.execute(
        `
        SELECT
            id,
            recommendation_id,
            recommendation_type,
            event_type,
            created_at
        FROM recommendation_events
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 10
        `,
        [userId]
    );

    return {
        total_recommendations_viewed:
            Number(summary.total_recommendations_viewed),
        accepted_recommendations:
            Number(summary.accepted_recommendations),
        rejected_recommendations:
            Number(summary.rejected_recommendations),
        favourite_recommendations:
            Number(summary.favourite_recommendations),
        most_recommended_exercise_categories: categories.map((category) => ({
            category: category.category,
            recommendation_count: Number(category.recommendation_count),
        })),
        interaction_history: history,
    };
}


module.exports = {
    getRecommendationAnalytics,
};
