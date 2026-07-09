const userService = require("../services/user.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const getProfile = asyncHandler(async (req, res) => {

    const profile = await userService.getUserProfile(
        req.user.user_id
    );

    success(res, profile);

});

module.exports = {
    getProfile,
};