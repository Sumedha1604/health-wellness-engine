const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const register = asyncHandler(async (req, res) => {

    const user = await authService.registerUser(req.body);

    success(
        res,
        user,
        "User registered successfully",
        201
    );

});

const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const result = await authService.loginUser(
        email,
        password
    );

    success(
        res,
        result,
        "Login successful"
    );

});

module.exports = {
    register,
    login,
};