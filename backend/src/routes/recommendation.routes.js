const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const recommendationController = require("../controllers/recommendation.controller");

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

module.exports = router;