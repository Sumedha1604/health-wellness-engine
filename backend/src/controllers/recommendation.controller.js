const recommendationService = require("../services/recommendation.service");

async function getRecommendations(req, res) {
  
  try {
    const recommendations =
      await recommendationService.generateRecommendations(
        req.user.user_id
      );

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  getRecommendations,
};