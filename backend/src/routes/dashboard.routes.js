const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

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

module.exports = router;