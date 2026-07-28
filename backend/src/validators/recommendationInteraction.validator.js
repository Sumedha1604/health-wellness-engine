const { body } = require("express-validator");


const interactionActions = [
    "VIEWED",
    "COMPLETED",
    "FAVORITED",
    "SKIPPED",
    "RATED",
];


const createRecommendationInteractionValidator = [

    body("exercise_id")
        .isInt({ min: 1 })
        .withMessage("Exercise ID must be a positive integer"),

    body("action")
        .isIn(interactionActions)
        .withMessage("Invalid recommendation interaction action"),

    body("rating")
        .optional({ nullable: true })
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),

    body("rating")
        .if(body("action").equals("RATED"))
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating is required when action is RATED"),
];


module.exports = {
    createRecommendationInteractionValidator,
};
