const { success } = require("../utils/response");
const NotFoundError = require("../errors/NotFoundError");
const exerciseService = require("../services/exercise.service");
const asyncHandler = require("../utils/asyncHandler");


const getExercises = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const exercises = await exerciseService.getExercises(
        page,
        limit
    );

    success(res, exercises);

});


const getExerciseById = asyncHandler(async (req, res) => {

    const exercise =
        await exerciseService.getExerciseById(
            req.params.id
        );

    if (!exercise) {
        throw new NotFoundError(
            "Exercise not found."
        );
    }

    success(res, exercise);

});


module.exports = {
    getExercises,
    getExerciseById,
};
