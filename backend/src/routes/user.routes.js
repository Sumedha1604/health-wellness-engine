const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User profile management
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     description: Returns the profile information of the currently authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
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
 *                   example: Request successful.
 *                 data:
 *                  $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized. JWT token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Unauthorized
 *       404:
 *         description: User profile not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: User not found
 */
router.get(
    "/profile",
    authenticateToken,
    userController.getProfile
);

module.exports = router;