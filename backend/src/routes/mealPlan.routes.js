const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const mealPlanController = require("../controllers/mealPlan.controller");

const {
    createMealPlanValidator,
    mealPlanIdValidator,
} = require("../validators/mealPlan.validator");

const validationMiddleware = require("../middleware/validation.middleware");

/**
 * @swagger
 * tags:
 *   - name: Meal Plans
 *     description: Manage user meal plans
 */

/**
 * @swagger
 * /api/meal-plans:
 *   post:
 *     summary: Create a meal plan
 *     description: Creates a new meal plan for the authenticated user.
 *     tags:
 *       - Meal Plans
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealPlanRequest'
 *     responses:
 *       201:
 *         description: Meal added successfully.
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Unauthorized.
 */
router.post(
    "/",
    authenticateToken,
    createMealPlanValidator,
    validationMiddleware,
    mealPlanController.createMealPlan
);

/**
 * @swagger
 * /api/meal-plans:
 *   get:
 *     summary: Get all meal plans
 *     description: Returns all meal plans for the authenticated user.
 *     tags:
 *       - Meal Plans
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meal plans retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MealPlan'
 */
router.get(
    "/",
    authenticateToken,
    mealPlanController.getMealPlans
);

/**
 * @swagger
 * /api/meal-plans/{mealPlanId}:
 *   get:
 *     summary: Get meal plan by ID
 *     description: Returns a specific meal plan.
 *     tags:
 *       - Meal Plans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealPlanId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meal plan ID.
 *     responses:
 *       200:
 *         description: Meal plan retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/MealPlan'
 *       404:
 *         description: Meal plan not found.
 */
router.get(
    "/:mealPlanId",
    authenticateToken,
    mealPlanIdValidator,
    validationMiddleware,
    mealPlanController.getMealPlanById
);

/**
 * @swagger
 * /api/meal-plans/{mealPlanId}:
 *   put:
 *     summary: Update a meal plan
 *     description: Updates an existing meal plan.
 *     tags:
 *       - Meal Plans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealPlanId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealPlanRequest'
 *     responses:
 *       200:
 *         description: Meal plan updated successfully.
 *       404:
 *         description: Meal plan not found.
 */
router.put(
    "/:mealPlanId",
    authenticateToken,
    mealPlanIdValidator,
    createMealPlanValidator,
    validationMiddleware,
    mealPlanController.updateMealPlan
);

/**
 * @swagger
 * /api/meal-plans/{mealPlanId}:
 *   delete:
 *     summary: Delete a meal plan
 *     description: Deletes a meal plan belonging to the authenticated user.
 *     tags:
 *       - Meal Plans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealPlanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meal plan deleted successfully.
 *       404:
 *         description: Meal plan not found.
 */
router.delete(
    "/:mealPlanId",
    authenticateToken,
    mealPlanIdValidator,
    validationMiddleware,
    mealPlanController.deleteMealPlan
);

module.exports = router;