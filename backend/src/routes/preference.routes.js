const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const preferenceController = require("../controllers/preference.controller");

const {
    preferenceValidator,
} = require("../validators/preference.validator");

const validationMiddleware = require("../middleware/validation.middleware");

/**
 * @swagger
 * tags:
 *   - name: Preferences
 *     description: User preference management
 */

/**
 * @swagger
 * /api/preferences:
 *   post:
 *     summary: Save user preferences
 *     description: Saves the authenticated user's health and wellness preferences.
 *     tags:
 *       - Preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PreferenceRequest'
 *     responses:
 *       201:
 *         description: Preferences saved successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Preferences saved successfully
 *               data:
 *                 message: Preferences saved successfully
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Validation failed
 *       401:
 *         description: Unauthorized. JWT token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Unauthorized
 */
router.post(
    "/",
    authenticateToken,
    preferenceValidator,
    validationMiddleware,
    preferenceController.savePreferences
);

module.exports = router;