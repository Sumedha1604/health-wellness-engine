const recommendationService = require("../services/recommendation.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const getRecommendations = asyncHandler(async (req, res) => {
    const recommendations =
        await recommendationService.generateRecommendations(
            req.user.user_id
        );

    success(res, recommendations);

});

module.exports = {
    getRecommendations,
};