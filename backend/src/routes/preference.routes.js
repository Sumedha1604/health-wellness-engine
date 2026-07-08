const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const preferenceController = require("../controllers/preference.controller");

router.post(
  "/",
  authenticateToken,
  preferenceController.createPreferences
);

module.exports = router;