const { body, param } = require("express-validator");

const addFavoriteValidator = [

    body("food_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Invalid food ID"),

    body("exercise_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Invalid exercise ID"),
];

const favoriteIdValidator = [

        param("favorite_id")
        .isInt({ min: 1 })
        .withMessage("Invalid favorite ID"),
];

module.exports = {
    addFavoriteValidator,
    favoriteIdValidator,
};