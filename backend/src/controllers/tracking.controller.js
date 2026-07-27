const trackingService = require("../services/tracking.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const logExercise = asyncHandler(async (req, res) => {

    const exerciseLog = await trackingService.logExercise(
        req.user.user_id,
        req.body
    );

    success(
        res,
        exerciseLog,
        "Exercise logged successfully",
        201
    );

});

const getTodayExerciseLogs = asyncHandler(async (req, res) => {

    const exerciseLogs =
        await trackingService.getTodayExerciseLogs(
            req.user.user_id
        );

    success(res, exerciseLogs);

});

const logWater = asyncHandler(async (req, res) => {

    const waterLog = await trackingService.logWater(
        req.user.user_id,
        req.body.amount_ml
    );

    success(
        res,
        waterLog,
        "Water logged successfully",
        201
    );

});

const getTodayWater = asyncHandler(async (req, res) => {

    const water = await trackingService.getTodayWater(
        req.user.user_id
    );

    success(res, water);

});

const logNutrition = asyncHandler(async (req, res) => {

    const nutritionLog = await trackingService.logNutrition(
        req.user.user_id,
        req.body
    );

    success(
        res,
        nutritionLog,
        "Nutrition logged successfully",
        201
    );

});

const getTodayNutritionLogs = asyncHandler(async (req, res) => {

    const nutritionLogs =
        await trackingService.getTodayNutritionLogs(
            req.user.user_id
        );

    success(res, nutritionLogs);

});

module.exports = {
    logExercise,
    getTodayExerciseLogs,
    logWater,
    getTodayWater,
    logNutrition,
    getTodayNutritionLogs,
};
