const { param, query } = require("express-validator");

const foodIdValidator = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid food ID"),
];

const paginationValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be at least 1"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
];

const searchValidator = [
    query("name")
        .trim()
        .notEmpty()
        .withMessage("Search name is required"),
];

module.exports = {
    foodIdValidator,
    paginationValidator,
    searchValidator,
};