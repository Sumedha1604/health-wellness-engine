const workoutPlanService = require("../services/workout_plan.service");
const asyncHandler = require("../utils/asyncHandler");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/BadRequestError");
const { success } = require("../utils/response");

const generateWorkoutPlan = asyncHandler(async (req, res) => {

    const plan = await workoutPlanService.generateWorkoutPlan(
        req.user.user_id
    );

    success(res, plan, "Workout plan generated successfully", 201);

});

const getWorkoutPlans = asyncHandler(async (req, res) => {

    const plans = await workoutPlanService.getWorkoutPlans(
        req.user.user_id
    );

    success(res, plans);

});

const getWorkoutPlanById = asyncHandler(async (req, res) => {

    const plan = await workoutPlanService.getWorkoutPlanById(
        req.user.user_id,
        req.params.id
    );

    if (!plan) {
        throw new NotFoundError("Workout plan not found");
    }

    success(res, plan);

});

const completeWorkoutPlan = asyncHandler(async (req, res) => {

    const completed = await workoutPlanService.completeWorkoutPlan(
        req.user.user_id,
        req.params.id
    );

    if (!completed) {
        throw new BadRequestError(
            "Workout plan was not found or has already been completed"
        );
    }

    success(res, null, "Workout plan completed successfully");

});

module.exports = {
    generateWorkoutPlan,
    getWorkoutPlans,
    getWorkoutPlanById,
    completeWorkoutPlan,
};
