const { body } = require("express-validator");

const preferenceValidator = [

    body("fitness_goal")
        .notEmpty()
        .withMessage("Fitness goal is required"),

    body("activity_level")
        .isIn([
            "Beginner",
            "Intermediate",
            "Advanced"
        ])
        .withMessage("Invalid activity level"),

    body("diet_type")
        .notEmpty()
        .withMessage("Diet type is required"),

    body("height_cm")
        .isFloat({
            min: 50,
            max: 300,
        })
        .withMessage("Height must be between 50 and 300 cm"),

    body("weight_kg")
        .isFloat({
            min: 20,
            max: 500,
        })
        .withMessage("Weight must be between 20 and 500 kg"),

    body("sleep_hours")
        .isFloat({
            min: 0,
            max: 24,
        })
        .withMessage("Sleep hours must be between 0 and 24"),

        body("stress_level")
        .isInt({
            min: 1,
            max: 10,
        })
        .withMessage("Stress level must be between 1 and 10"),
];

module.exports = {
    preferenceValidator,
};