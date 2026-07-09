const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const favoriteController = require("../controllers/favorite.controller");

const {
    addFavoriteValidator,
    favoriteIdValidator,
} = require("../validators/favorite.validator");

const validationMiddleware = require("../middleware/validation.middleware");

router.post(
    "/",
    authenticateToken,
    addFavoriteValidator,
    validationMiddleware,
    favoriteController.addFavorite
);

router.get(
    "/",
    authenticateToken,
    favoriteController.getFavorites
);

router.delete(
    "/:favorite_id",
    authenticateToken,
    favoriteIdValidator,
    validationMiddleware,
    favoriteController.deleteFavorite
);

module.exports = router;