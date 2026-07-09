const { success } = require("../utils/response");
const NotFoundError = require("../errors/NotFoundError");
const foodService = require("../services/food.service");
const asyncHandler = require("../utils/asyncHandler");

const getFoods = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const foods = await foodService.getFoods(page, limit);

    success(res, foods);

});

const getFoodById = asyncHandler(async (req, res) => {

    const food = await foodService.getFoodById(req.params.id);

    if (!food) {
        throw new NotFoundError("Food not found.");
    }

    success(res, food);

});

const searchFoods = asyncHandler(async (req, res) => {

    const { name } = req.query;

    const foods = await foodService.searchFoods(name);

    success(res, foods);

});

module.exports = {
    getFoods,
    getFoodById,
    searchFoods,
};