const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");

const {
    registerValidator,
    loginValidator,
} = require("../validators/auth.validator");

const validationMiddleware = require("../middleware/validation.middleware");

router.post(
    "/register",
    registerValidator,
    validationMiddleware,
    authController.register
);

router.post(
    "/login",
    loginValidator,
    validationMiddleware,
    authController.login
);

module.exports = router;