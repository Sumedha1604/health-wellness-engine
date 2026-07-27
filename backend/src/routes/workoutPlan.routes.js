const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const workoutPlanController = require("../controllers/workoutPlan.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const {
    workoutPlanIdValidator,
} = require("../validators/workoutPlan.validator");

router.post(
    "/generate",
    authenticateToken,
    workoutPlanController.generateWorkoutPlan
);

router.get(
    "/",
    authenticateToken,
    workoutPlanController.getWorkoutPlans
);

router.get(
    "/:id",
    authenticateToken,
    workoutPlanIdValidator,
    validationMiddleware,
    workoutPlanController.getWorkoutPlanById
);

router.post(
    "/:id/complete",
    authenticateToken,
    workoutPlanIdValidator,
    validationMiddleware,
    workoutPlanController.completeWorkoutPlan
);

module.exports = router;
