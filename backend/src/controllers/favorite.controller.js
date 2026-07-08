const favoriteService = require("../services/favorite.service");

async function addFavorite(req, res) {
  try {
    const result = await favoriteService.addFavorite(
      req.user.user_id,
      req.body
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function getFavorites(req, res) {
  try {
    const favorites = await favoriteService.getFavorites(
      req.user.user_id
    );

    res.json(favorites);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

async function deleteFavorite(req, res) {
  try {
    const result = await favoriteService.deleteFavorite(
      req.user.user_id,
      req.params.favorite_id
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  addFavorite,
  getFavorites,
  deleteFavorite,
};