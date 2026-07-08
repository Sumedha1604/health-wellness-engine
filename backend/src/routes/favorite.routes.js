const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const favoriteController = require("../controllers/favorite.controller");

router.post(
  "/",
  authenticateToken,
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
  favoriteController.deleteFavorite
);

module.exports = router;