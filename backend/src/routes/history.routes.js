const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const historyController = require("../controllers/history.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const { historyPeriodValidator } = require("../validators/history.validator");

router.get(
    "/",
    authenticateToken,
    historyPeriodValidator,
    validationMiddleware,
    historyController.getUserHistory
);

module.exports = router;
