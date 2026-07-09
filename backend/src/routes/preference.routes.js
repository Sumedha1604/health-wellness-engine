const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const preferenceController = require("../controllers/preference.controller");

const {
  preferenceValidator,
} = require("../validators/preference.validator");

const validationMiddleware = require("../middleware/validation.middleware");

router.post(
  "/",
  authenticateToken,
  preferenceValidator,
  validationMiddleware,
  preferenceController.savePreferences
);

module.exports = router;