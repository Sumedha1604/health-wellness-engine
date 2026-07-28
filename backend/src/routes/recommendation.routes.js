const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const recommendationController = require("../controllers/recommendation.controller");
const recommendationFeedbackController =
    require("../controllers/recommendationFeedback.controller");
const recommendationInteractionController =
    require("../controllers/recommendationInteraction.controller");
const validationMiddleware =
    require("../middleware/validation.middleware");

const {
    createRecommendationFeedbackValidator,
} = require("../validators/recommendationFeedback.validator");
const {
    createRecommendationInteractionValidator,
} = require("../validators/recommendationInteraction.validator");

/**
 * @swagger
 * tags:
 *   - name: Recommendations
 *     description: Personalized health and wellness recommendations
 */

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get personalized recommendations
 *     description: Returns personalized calorie, workout, and food recommendations based on the authenticated user's preferences.
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   $ref: '#/components/schemas/Recommendation'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User preferences not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    "/",
    authenticateToken,
    recommendationController.getRecommendations
);

router.post(
    "/feedback",
    authenticateToken,
    createRecommendationFeedbackValidator,
    validationMiddleware,
    recommendationFeedbackController.createRecommendationFeedback
);

router.get(
    "/feedback",
    authenticateToken,
    recommendationFeedbackController.getRecommendationFeedback
);

router.get(
    "/feedback/history",
    authenticateToken,
    recommendationFeedbackController.getRecommendationFeedbackHistory
);

router.post(
    "/interactions",
    authenticateToken,
    createRecommendationInteractionValidator,
    validationMiddleware,
    recommendationInteractionController.createRecommendationInteraction
);

router.get(
    "/interactions",
    authenticateToken,
    recommendationInteractionController.getRecommendationInteractions
);

module.exports = router;
