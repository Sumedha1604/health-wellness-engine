const recommendationAnalyticsService =
    require("../services/recommendation_analytics.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");


const getRecommendationAnalytics = asyncHandler(async (req, res) => {

    const analytics =
        await recommendationAnalyticsService.getRecommendationAnalytics(
            req.user.user_id
        );

    success(res, analytics);

});


module.exports = {
    getRecommendationAnalytics,
};
