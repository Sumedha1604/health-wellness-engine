const preferenceService = require("../services/preference.service");

async function createPreferences(req, res) {
  try {
    const result = await preferenceService.savePreferences(
      req.user.user_id,
      req.body
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  createPreferences,
};