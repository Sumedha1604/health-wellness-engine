const { body } = require("express-validator");

const sendChatMessageValidator = [

    body("message")
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage("Message must be between 1 and 2000 characters"),
];

module.exports = {
    sendChatMessageValidator,
};
