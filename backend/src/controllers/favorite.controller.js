const favoriteService = require("../services/favorite.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const addFavorite = asyncHandler(async (req, res) => {

    const favorite = await favoriteService.addFavorite(
        req.user.user_id,
        req.body
    );

    success(
        res,
        favorite,
        "Favorite added successfully",
        201
    );

});

const getFavorites = asyncHandler(async (req, res) => {

    const favorites = await favoriteService.getFavorites(
        req.user.user_id
    );

    success(res, favorites);

});

const deleteFavorite = asyncHandler(async (req, res) => {

    const result = await favoriteService.deleteFavorite(
        req.user.user_id,
        req.params.favorite_id
    );

    success(
        res,
        result,
        "Favorite deleted successfully"
    );

});

module.exports = {
    addFavorite,
    getFavorites,
    deleteFavorite,
};