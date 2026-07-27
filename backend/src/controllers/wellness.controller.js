const wellnessService = require("../services/wellness.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const getDailyWellnessSummary = asyncHandler(async (req, res) => {

    const summary = await wellnessService.getDailyWellnessSummary(
        req.user.user_id
    );

    success(res, summary);

});

module.exports = {
    getDailyWellnessSummary,
};
