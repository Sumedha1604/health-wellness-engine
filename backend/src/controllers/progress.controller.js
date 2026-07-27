const progressService = require("../services/progress.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const getProgressOverview = asyncHandler(async (req, res) => {

    const overview = await progressService.getProgressOverview(
        req.user.user_id
    );

    success(res, overview);

});

const getProgressHistory = asyncHandler(async (req, res) => {

    const history = await progressService.getProgressHistory(
        req.user.user_id
    );

    success(res, history);

});

module.exports = {
    getProgressOverview,
    getProgressHistory,
};
