const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const progressController = require("../controllers/progress.controller");

router.get(
    "/overview",
    authenticateToken,
    progressController.getProgressOverview
);

router.get(
    "/history",
    authenticateToken,
    progressController.getProgressHistory
);

module.exports = router;
