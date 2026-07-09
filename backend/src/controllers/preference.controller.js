const preferenceService = require("../services/preference.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const savePreferences = asyncHandler(async (req, res) => {

    const result = await preferenceService.savePreferences(
        req.user.user_id,
        req.body
    );

    success(
        res,
        result,
        "Preferences saved successfully",
        201
    );

});

module.exports = {
    savePreferences,
};