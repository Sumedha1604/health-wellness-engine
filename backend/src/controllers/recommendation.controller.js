const recommendationService = require("../services/recommendation.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const getRecommendations = asyncHandler(async (req, res) => {

    console.log("1. Controller entered");
    console.log("User:", req.user);

    console.log("2. Calling service");

    const recommendations =
        await recommendationService.generateRecommendations(
            req.user.user_id
        );

    console.log("3. Service finished");

    success(res, recommendations);

});

module.exports = {
    getRecommendations,
};