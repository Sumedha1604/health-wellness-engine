const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: User dashboard and daily nutrition summary
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard
 *     description: Returns the authenticated user's profile summary and saved preferences.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully.
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
 *                   $ref: '#/components/schemas/Dashboard'
 *       401:
 *         description: Unauthorized.
 */
router.get(
    "/",
    authenticateToken,
    dashboardController.getDashboard
);

/**
 * @swagger
 * /api/dashboard/today:
 *   get:
 *     summary: Get today's nutrition summary
 *     description: Returns today's meals and total nutritional intake for the authenticated user.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's summary retrieved successfully.
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
 *                   $ref: '#/components/schemas/TodaySummary'
 *       401:
 *         description: Unauthorized.
 */
router.get(
    "/today",
    authenticateToken,
    dashboardController.getTodaySummary
);

module.exports = router;