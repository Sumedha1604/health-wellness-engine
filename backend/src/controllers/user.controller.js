const userService = require("../services/user.service");

async function getProfile(req, res) {
  try {
    const profile = await userService.getUserProfile(
      req.user.user_id
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  getProfile,
};