const recommendationFeedbackService =
    require("../services/recommendation_feedback.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const createRecommendationFeedback = asyncHandler(async (req, res) => {

    const feedback =
        await recommendationFeedbackService.createRecommendationFeedback(
            req.user.user_id,
            req.body
        );

    success(
        res,
        feedback,
        "Feedback saved successfully",
        201
    );

});

const getRecommendationFeedback = asyncHandler(async (req, res) => {

    const feedback =
        await recommendationFeedbackService.getRecommendationFeedback(
            req.user.user_id
        );

    success(res, feedback);

});

const getRecommendationFeedbackHistory = asyncHandler(async (req, res) => {

    const feedback =
        await recommendationFeedbackService.getRecommendationFeedback(
            req.user.user_id
        );

    success(res, feedback);

});

module.exports = {
    createRecommendationFeedback,
    getRecommendationFeedback,
    getRecommendationFeedbackHistory,
};
