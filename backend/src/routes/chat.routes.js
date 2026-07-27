const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const chatController = require("../controllers/chat.controller");
const validationMiddleware =
    require("../middleware/validation.middleware");

const {
    sendChatMessageValidator,
} = require("../validators/chat.validator");

router.post(
    "/",
    authenticateToken,
    sendChatMessageValidator,
    validationMiddleware,
    chatController.sendMessage
);

module.exports = router;
