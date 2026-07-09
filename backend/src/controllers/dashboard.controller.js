const dashboardService = require("../services/dashboard.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const getDashboard = asyncHandler(async (req, res) => {

    const dashboard = await dashboardService.getDashboard(
        req.user.user_id
    );

    success(res, dashboard);

});

const getTodaySummary = asyncHandler(async (req, res) => {

    const summary = await dashboardService.getTodaySummary(
        req.user.user_id
    );

    success(res, summary);

});

module.exports = {
    getDashboard,
    getTodaySummary,
};