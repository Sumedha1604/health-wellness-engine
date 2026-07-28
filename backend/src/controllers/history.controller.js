const historyService = require("../services/history.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const getUserHistory = asyncHandler(async (req, res) => {

    const history = await historyService.getUserHistory(
        req.user.user_id,
        req.query.period
    );

    success(res, history);

});

module.exports = {
    getUserHistory,
};
