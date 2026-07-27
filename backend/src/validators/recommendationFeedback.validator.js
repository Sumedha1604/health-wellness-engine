const { body } = require("express-validator");

const createRecommendationFeedbackValidator = [

    body("recommendation_type")
        .isIn([
            "exercise",
            "food",
        ])
        .withMessage("Recommendation type must be exercise or food"),

    body("recommendation_id")
        .isInt({ min: 1 })
        .withMessage("Recommendation ID must be a positive integer"),

    body("feedback")
        .isIn([
            "like",
            "dislike",
            "viewed",
        ])
        .withMessage("Feedback must be like, dislike, or viewed"),
];

module.exports = {
    createRecommendationFeedbackValidator,
};
