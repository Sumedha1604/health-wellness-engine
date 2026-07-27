const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const trackingController =
    require("../controllers/tracking.controller");
const validationMiddleware =
    require("../middleware/validation.middleware");

const {
    logExerciseValidator,
    logWaterValidator,
    logNutritionValidator,
} = require("../validators/tracking.validator");

router.post(
    "/exercise",
    authenticateToken,
    logExerciseValidator,
    validationMiddleware,
    trackingController.logExercise
);

router.get(
    "/exercise/today",
    authenticateToken,
    trackingController.getTodayExerciseLogs
);

router.post(
    "/water",
    authenticateToken,
    logWaterValidator,
    validationMiddleware,
    trackingController.logWater
);

router.get(
    "/water/today",
    authenticateToken,
    trackingController.getTodayWater
);

router.post(
    "/nutrition",
    authenticateToken,
    logNutritionValidator,
    validationMiddleware,
    trackingController.logNutrition
);

router.get(
    "/nutrition/today",
    authenticateToken,
    trackingController.getTodayNutritionLogs
);

module.exports = router;
