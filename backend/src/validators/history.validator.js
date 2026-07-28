const { query } = require("express-validator");

const historyPeriodValidator = [
    query("period")
        .optional()
        .isIn(["today", "last7days", "last30days"])
        .withMessage("Period must be today, last7days, or last30days"),
];

module.exports = {
    historyPeriodValidator,
};
