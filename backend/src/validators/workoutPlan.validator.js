const { param } = require("express-validator");

const workoutPlanIdValidator = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Workout plan ID must be a positive integer"),
];

module.exports = {
    workoutPlanIdValidator,
};
