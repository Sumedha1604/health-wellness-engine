const { body, param } = require("express-validator");

const createMealPlanValidator = [

    body("food_id")
        .isInt({ min: 1 })
        .withMessage("Food ID must be a positive integer"),

    body("meal_type")
        .isIn([
            "Breakfast",
            "Lunch",
            "Dinner",
            "Snack"
        ])
        .withMessage("Invalid meal type"),

    body("meal_date")
        .isISO8601()
        .withMessage("Meal date must be a valid date"),

    body("quantity")
        .isFloat({ min: 0.1 })
        .withMessage("Quantity must be greater than 0"),
];

const mealPlanIdValidator = [

    param("mealPlanId")
        .isInt({ min: 1 })
        .withMessage("Invalid meal plan ID"),
];

module.exports = {
    createMealPlanValidator,
    mealPlanIdValidator,
};