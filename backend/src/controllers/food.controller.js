const foodService = require("../services/food.service");

async function getFoods(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const foods = await foodService.getFoods(page, limit);

        res.json(foods);
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
}

async function getFoodById(req, res) {
    try {
        const food = await foodService.getFoodById(req.params.id);

        if (!food) {
            return res.status(404).json({
                error: "Food not found."
            });
        }

        res.json(food);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
}

async function searchFoods(req, res) {
    try {
        const { name } = req.query;

        const foods = await foodService.searchFoods(name);

        res.json(foods);
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
}

module.exports = {
    getFoods,
    getFoodById,
    searchFoods,
};