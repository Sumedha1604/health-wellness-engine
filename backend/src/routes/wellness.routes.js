const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const wellnessController = require("../controllers/wellness.controller");

router.get(
    "/summary",
    authenticateToken,
    wellnessController.getDailyWellnessSummary
);

module.exports = router;
