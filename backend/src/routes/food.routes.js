const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const foodController = require("../controllers/food.controller");

const {
    foodIdValidator,
    paginationValidator,
    searchValidator,
} = require("../validators/food.validator");

const validationMiddleware = require("../middleware/validation.middleware");

/**
 * @swagger
 * tags:
 *   - name: Foods
 *     description: Food catalogue and search endpoints
 */

/**
 * @swagger
 * /api/foods:
 *   get:
 *     summary: Get all foods
 *     description: Returns a paginated list of foods.
 *     tags:
 *       - Foods
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of foods per page.
 *     responses:
 *       200:
 *         description: Foods retrieved successfully.
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
 *                   $ref: '#/components/schemas/FoodListResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    "/",
    authenticateToken,
    paginationValidator,
    validationMiddleware,
    foodController.getFoods
);

/**
 * @swagger
 * /api/foods/search:
 *   get:
 *     summary: Search foods
 *     description: Searches foods by name.
 *     tags:
 *       - Foods
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: Chicken
 *         description: Food name to search.
 *     responses:
 *       200:
 *         description: Matching foods returned successfully.
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
 *                     $ref: '#/components/schemas/Food'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    "/search",
    authenticateToken,
    searchValidator,
    validationMiddleware,
    foodController.searchFoods
);

/**
 * @swagger
 * /api/foods/{id}:
 *   get:
 *     summary: Get food by ID
 *     description: Returns a single food by its unique ID.
 *     tags:
 *       - Foods
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food ID.
 *     responses:
 *       200:
 *         description: Food retrieved successfully.
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
 *                   $ref: '#/components/schemas/Food'
 *       404:
 *         description: Food not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    "/:id",
    authenticateToken,
    foodIdValidator,
    validationMiddleware,
    foodController.getFoodById
);

module.exports = router;