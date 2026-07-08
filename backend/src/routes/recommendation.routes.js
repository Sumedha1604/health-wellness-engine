const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const recommendationController = require("../controllers/recommendation.controller");

router.get(
  "/",
  authenticateToken,
  recommendationController.getRecommendations
);

module.exports = router;