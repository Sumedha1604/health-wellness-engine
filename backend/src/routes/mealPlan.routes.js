const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const mealPlanController = require("../controllers/mealPlan.controller");

const {
    createMealPlanValidator,
    mealPlanIdValidator,
} = require("../validators/mealPlan.validator");

const validationMiddleware = require("../middleware/validation.middleware");

router.post(
    "/",
    authenticateToken,
    createMealPlanValidator,
    validationMiddleware,
    mealPlanController.createMealPlan
);

router.get(
    "/",
    authenticateToken,
    mealPlanController.getMealPlans
);

router.get(
    "/:mealPlanId",
    authenticateToken,
    mealPlanIdValidator,
    validationMiddleware,
    mealPlanController.getMealPlanById
);

router.put(
    "/:mealPlanId",
    authenticateToken,
    mealPlanIdValidator,
    createMealPlanValidator,
    validationMiddleware,
    mealPlanController.updateMealPlan
);

router.delete(
    "/:mealPlanId",
    authenticateToken,
    mealPlanIdValidator,
    validationMiddleware,
    mealPlanController.deleteMealPlan
);

module.exports = router;