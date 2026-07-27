const { body } = require("express-validator");

const logExerciseValidator = [

    body("exercise_id")
        .isInt({ min: 1 })
        .withMessage("Exercise ID must be a positive integer"),

    body("duration_minutes")
        .isInt({ min: 1 })
        .withMessage("Duration must be at least 1 minute"),

    body("calories_burned")
        .isFloat({ min: 0 })
        .withMessage("Calories burned must be 0 or greater"),
];

const logWaterValidator = [

    body("amount_ml")
        .isInt({ min: 1 })
        .withMessage("Water amount must be at least 1 ml"),
];

const logNutritionValidator = [

    body("food_id")
        .isInt({ min: 1 })
        .withMessage("Food ID must be a positive integer"),

    body("quantity")
        .isFloat({ min: 0.1 })
        .withMessage("Quantity must be greater than 0"),
];

module.exports = {
    logExerciseValidator,
    logWaterValidator,
    logNutritionValidator,
};
