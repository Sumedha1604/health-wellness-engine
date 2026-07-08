const authService = require("../services/auth.service");

async function register(req, res) {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.json({
      message: "Login successful",
      ...result,
    });
  } catch (err) {
    res.status(401).json({
      error: err.message,
    });
  }
}

module.exports = {
  register,
  login,
};
