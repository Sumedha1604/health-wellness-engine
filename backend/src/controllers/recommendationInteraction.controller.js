const recommendationInteractionService =
    require("../services/recommendation_interaction.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");


const createRecommendationInteraction = asyncHandler(async (req, res) => {

    const interaction =
        await recommendationInteractionService.saveRecommendationInteraction(
            req.user.user_id,
            req.body
        );

    success(
        res,
        interaction,
        "Recommendation interaction saved successfully",
        201
    );

});


const getRecommendationInteractions = asyncHandler(async (req, res) => {

    const interactions =
        await recommendationInteractionService.getUserInteractionHistory(
            req.user.user_id
        );

    success(res, interactions);

});


module.exports = {
    createRecommendationInteraction,
    getRecommendationInteractions,
};
