const mealPlanService = require("../services/mealPlan.service");
const asyncHandler = require("../utils/asyncHandler");
const NotFoundError = require("../errors/NotFoundError");
const { success } = require("../utils/response");

const createMealPlan = asyncHandler(async (req, res) => {

    const mealPlan = await mealPlanService.createMealPlan(
        req.user.user_id,
        req.body
    );
    
    success(
        res,
        mealPlan,
        "Meal added successfully",
        201
    );

});

const getMealPlans = asyncHandler(async (req, res) => {

    const mealPlans = await mealPlanService.getMealPlans(
        req.user.user_id
    );

    success(res, mealPlans);

});

const getMealPlanById = asyncHandler(async (req, res) => {

    const mealPlan = await mealPlanService.getMealPlanById(
        req.user.user_id,
        req.params.mealPlanId
    );

    if (!mealPlan) {
        throw new NotFoundError("Meal plan not found");
    }

    success(res, mealPlan);

});

const updateMealPlan = asyncHandler(async (req, res) => {

    const updated = await mealPlanService.updateMealPlan(
        req.user.user_id,
        req.params.mealPlanId,
        req.body
    );

    if (!updated) {
        throw new NotFoundError("Meal plan not found");
    }

    success(
        res,
        null,
        "Meal plan updated successfully"
    );

});

const deleteMealPlan = asyncHandler(async (req, res) => {

    const deleted = await mealPlanService.deleteMealPlan(
        req.user.user_id,
        req.params.mealPlanId
    );

    if (!deleted) {
        throw new NotFoundError("Meal plan not found");
    }

    success(
        res,
        null,
        "Meal plan deleted successfully"
    );

});

module.exports = {
    createMealPlan,
    getMealPlans,
    getMealPlanById,
    updateMealPlan,
    deleteMealPlan,
};