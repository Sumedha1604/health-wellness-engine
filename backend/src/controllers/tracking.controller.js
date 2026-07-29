const trackingService = require("../services/tracking.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

function disableTrackingCache(req, res) {

    res.set("Cache-Control", "no-store");

    delete req.headers["if-none-match"];
    delete req.headers["if-modified-since"];

}

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

    disableTrackingCache(req, res);
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

    disableTrackingCache(req, res);
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

    disableTrackingCache(req, res);
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
