const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const exerciseController = require("../controllers/exercise.controller");


router.get(
    "/",
    authenticateToken,
    exerciseController.getExercises
);


router.get(
    "/:id",
    authenticateToken,
    exerciseController.getExerciseById
);


module.exports = router;
