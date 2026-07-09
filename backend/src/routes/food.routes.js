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

router.get(
    "/",
    authenticateToken,
    paginationValidator,
    validationMiddleware,
    foodController.getFoods
);

router.get(
    "/search",
    authenticateToken,
    searchValidator,
    validationMiddleware,
    foodController.searchFoods
);

router.get(
    "/:id",
    authenticateToken,
    foodIdValidator,
    validationMiddleware,
    foodController.getFoodById
);

module.exports = router;