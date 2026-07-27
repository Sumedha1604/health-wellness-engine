const aiService = require("../services/ai.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const sendMessage = asyncHandler(async (req, res) => {

    const context = await aiService.buildUserContext(
        req.user.user_id
    );

    const reply = await aiService.generateResponse(
        req.body.message,
        context
    );

    await aiService.saveConversation(
        req.user.user_id,
        req.body.message,
        reply
    );

    success(res, { reply });

});

module.exports = {
    sendMessage,
};
