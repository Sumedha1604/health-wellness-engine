const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

router.get(
  "/profile",
  authenticateToken,
  userController.getProfile
);

module.exports = router;