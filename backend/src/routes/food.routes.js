const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const foodController = require("../controllers/food.controller");

router.get(
    "/",
    authenticateToken,
    foodController.getFoods
);

router.get(
    "/search",
    authenticateToken,
    foodController.searchFoods
);

router.get(
    "/:id",
    authenticateToken,
    foodController.getFoodById
);

module.exports = router;