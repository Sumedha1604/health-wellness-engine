const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: User dashboard and daily nutrition summary
 */

router.get(
    "/",
    authenticateToken,
    dashboardController.getDashboard
);

router.get(
    "/today",
    authenticateToken,
    dashboardController.getTodaySummary
);

router.get(
    "/recent-meals",
    authenticateToken,
    dashboardController.getRecentMeals
);

router.get(
    "/weekly-calories",
    authenticateToken,
    dashboardController.getWeeklyCalories
);

module.exports = router;