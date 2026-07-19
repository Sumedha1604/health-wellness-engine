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

const getRecentMeals = asyncHandler(async (req, res) => {

    const meals = await dashboardService.getRecentMeals(
        req.user.user_id
    );

    success(res, meals);

});

const getWeeklyCalories = asyncHandler(async (req, res) => {

    const weeklyCalories = await dashboardService.getWeeklyCalories(
        req.user.user_id
    );

    success(res, weeklyCalories);

});

module.exports = {
    getDashboard,
    getTodaySummary,
    getRecentMeals,
    getWeeklyCalories,
};