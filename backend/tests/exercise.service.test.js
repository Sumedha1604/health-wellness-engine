jest.mock("../src/config/db", () => ({
    query: jest.fn(),
    execute: jest.fn(),
}));

const db = require("../src/config/db");

const exerciseService = require("../src/services/exercise.service");

describe("Exercise service", () => {

    beforeEach(() => {
        db.query.mockReset();
        db.execute.mockReset();
    });

    test("getExercises returns paginated data with default filters", async () => {

        db.query
            .mockResolvedValueOnce([
                [
                    {
                        exercise_id: 1,
                        title: "Push-Up",
                        exercise_type: "Strength",
                        body_part: "Chest",
                        equipment: "Body Only",
                        difficulty_level: "Beginner",
                        rating: 8,
                    },
                ],
            ])
            .mockResolvedValueOnce([
                [
                    {
                        total: 1,
                    },
                ],
            ]);

        const result = await exerciseService.getExercises(1, 20, {});

        expect(db.query).toHaveBeenCalledTimes(2);

        expect(db.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("SELECT"),
            []
        );

        expect(result).toEqual({
            page: 1,
            limit: 20,
            total: 1,
            data: [
                {
                    exercise_id: 1,
                    title: "Push-Up",
                    exercise_type: "Strength",
                    body_part: "Chest",
                    equipment: "Body Only",
                    difficulty_level: "Beginner",
                    rating: 8,
                },
            ],
        });

    });

    test("getExercises applies the search filter", async () => {

        db.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 0 }]]);

        await exerciseService.getExercises(1, 20, {
            search: "push",
        });

        expect(db.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("LIKE"),
            ["%push%", "%push%", "%push%"]
        );

    });

    test("getExercises applies the body_part filter", async () => {

        db.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 0 }]]);

        await exerciseService.getExercises(1, 20, {
            body_part: "Chest",
        });

        expect(db.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("body_part = ?"),
            ["Chest"]
        );

    });

    test("getExercises applies the equipment filter", async () => {

        db.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 0 }]]);

        await exerciseService.getExercises(1, 20, {
            equipment: "Dumbbell",
        });

        expect(db.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("equipment = ?"),
            ["Dumbbell"]
        );

    });

    test("getExercises applies the difficulty filter", async () => {

        db.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 0 }]]);

        await exerciseService.getExercises(1, 20, {
            difficulty: "Intermediate",
        });

        expect(db.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("difficulty_level = ?"),
            ["Intermediate"]
        );

    });

    test("getExercises ignores body_part, equipment, and difficulty when set to All", async () => {

        db.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 0 }]]);

        await exerciseService.getExercises(1, 20, {
            body_part: "All",
            equipment: "All",
            difficulty: "All",
        });

        expect(db.query).toHaveBeenNthCalledWith(
            1,
            expect.not.stringContaining("WHERE"),
            []
        );

    });

    test("getExercises combines multiple filters together", async () => {

        db.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 0 }]]);

        await exerciseService.getExercises(2, 10, {
            search: "curl",
            equipment: "Dumbbell",
        });

        expect(db.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("AND"),
            ["%curl%", "%curl%", "%curl%", "Dumbbell"]
        );

    });

    test("getExerciseById returns the exercise when found", async () => {

        db.execute.mockResolvedValueOnce([
            [
                {
                    exercise_id: 5,
                    title: "Barbell Squat",
                },
            ],
        ]);

        const result = await exerciseService.getExerciseById(5);

        expect(db.execute).toHaveBeenCalledWith(
            expect.stringContaining("WHERE exercise_id = ?"),
            [5]
        );

        expect(result).toEqual({
            exercise_id: 5,
            title: "Barbell Squat",
        });

    });

    test("getExerciseById returns null when the exercise does not exist", async () => {

        db.execute.mockResolvedValueOnce([[]]);

        const result = await exerciseService.getExerciseById(999999);

        expect(result).toBeNull();

    });

});