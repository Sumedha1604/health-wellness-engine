jest.mock("../src/config/db", () => ({
    execute: jest.fn(),
    getConnection: jest.fn(),
}));

jest.mock("../src/services/recommendation.service", () => ({
    generateRecommendations: jest.fn(),
}));

jest.mock("../src/services/ai.service", () => ({
    generateResponse: jest.fn(),
}));

const db = require("../src/config/db");
const recommendationService = require("../src/services/recommendation.service");
const aiService = require("../src/services/ai.service");
const workoutPlanService = require("../src/services/workout_plan.service");

function createExercises(count = 6) {

    return Array.from({ length: count }, (_, index) => ({
        exercise_id: index + 1,
        title: `Exercise ${index + 1}`,
        body_part: "Chest",
        equipment: "Dumbbell",
        difficulty_level: "Beginner",
    }));

}

describe("Workout plan service", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("uses training days appropriate to activity level", () => {

        expect(workoutPlanService.getTrainingDays("Beginner")).toEqual([1, 3, 5]);
        expect(workoutPlanService.getTrainingDays("Intermediate")).toEqual([1, 3, 5, 6]);
        expect(workoutPlanService.getTrainingDays("Advanced")).toEqual([1, 2, 4, 5, 6]);

    });

    test("uses goal-aware workout details", () => {

        expect(
            workoutPlanService.getWorkoutDetails("Muscle Gain", "Intermediate")
        ).toEqual({ sets: 4, reps: "8-12", duration_minutes: 40 });
        expect(
            workoutPlanService.getWorkoutDetails("Weight Loss", "Advanced")
        ).toEqual({ sets: 3, reps: "12-15", duration_minutes: 50 });

    });

    test("generates and saves a plan from recommendation exercises", async () => {

        const connection = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
            execute: jest.fn()
                .mockResolvedValueOnce([{ insertId: 44 }])
                .mockResolvedValue([{}]),
        };

        db.execute
            .mockResolvedValueOnce([[
                { fitness_goal: "Muscle Gain", activity_level: "Beginner" },
            ]])
            .mockResolvedValueOnce([[]]);
        db.getConnection.mockResolvedValue(connection);
        recommendationService.generateRecommendations.mockResolvedValue({
            recommended_exercises: createExercises(),
        });
        aiService.generateResponse.mockResolvedValue("A focused strength plan.");

        const result = await workoutPlanService.generateWorkoutPlan(7);

        expect(result).toEqual(
            expect.objectContaining({
                id: 44,
                goal: "Muscle Gain",
                exercises: expect.any(Array),
            })
        );
        expect(result.exercises).toHaveLength(6);
        expect(connection.beginTransaction).toHaveBeenCalled();
        expect(connection.commit).toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalled();

    });

    test("falls back to goal-matched exercises when recommendations are empty", async () => {

        const connection = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
            execute: jest.fn()
                .mockResolvedValueOnce([{ insertId: 45 }])
                .mockResolvedValue([{}]),
        };

        db.execute
            .mockResolvedValueOnce([[
                { fitness_goal: "Weight Loss", activity_level: "Beginner" },
            ]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([createExercises(6)]);
        db.getConnection.mockResolvedValue(connection);
        recommendationService.generateRecommendations.mockResolvedValue({
            recommended_exercises: [],
        });
        aiService.generateResponse.mockResolvedValue("A balanced cardio plan.");

        const result = await workoutPlanService.generateWorkoutPlan(8);

        expect(result.exercises).toHaveLength(6);
        expect(db.execute).toHaveBeenCalledTimes(3);

    });

    test("reuses fallback exercises when every match appears in recent history", async () => {

        const connection = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
            execute: jest.fn()
                .mockResolvedValueOnce([{ insertId: 46 }])
                .mockResolvedValue([{}]),
        };
        const fallbackExercises = createExercises(6);

        db.execute
            .mockResolvedValueOnce([[
                { fitness_goal: "Weight Loss", activity_level: "Beginner" },
            ]])
            .mockResolvedValueOnce([
                fallbackExercises.map((exercise) => ({
                    exercise_id: exercise.exercise_id,
                })),
            ])
            .mockResolvedValueOnce([fallbackExercises]);
        db.getConnection.mockResolvedValue(connection);
        recommendationService.generateRecommendations.mockResolvedValue({
            recommended_exercises: [],
        });
        aiService.generateResponse.mockResolvedValue("A flexible cardio plan.");

        const result = await workoutPlanService.generateWorkoutPlan(9);

        expect(result.exercises).toHaveLength(6);

    });

    test("generates a plan when the recommendation service is unavailable", async () => {

        const connection = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
            execute: jest.fn()
                .mockResolvedValueOnce([{ insertId: 47 }])
                .mockResolvedValue([{}]),
        };

        db.execute
            .mockResolvedValueOnce([[
                { fitness_goal: "Muscle Gain", activity_level: "Beginner" },
            ]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([createExercises(6)]);
        db.getConnection.mockResolvedValue(connection);
        recommendationService.generateRecommendations.mockRejectedValue(
            new Error("ML service unavailable")
        );
        aiService.generateResponse.mockResolvedValue("A fallback strength plan.");

        const result = await workoutPlanService.generateWorkoutPlan(10);

        expect(result.id).toBe(47);
        expect(result.exercises).toHaveLength(6);

    });

    test("uses the exercise catalogue when goal-matched fallback exercises are unavailable", async () => {

        const connection = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
            execute: jest.fn()
                .mockResolvedValueOnce([{ insertId: 48 }])
                .mockResolvedValue([{}]),
        };
        const catalogueExercises = createExercises(6);

        db.execute
            .mockResolvedValueOnce([[
                { fitness_goal: "Muscle Gain", activity_level: "Beginner" },
            ]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([catalogueExercises]);
        db.getConnection.mockResolvedValue(connection);
        recommendationService.generateRecommendations.mockResolvedValue({
            recommended_exercises: [],
        });
        aiService.generateResponse.mockResolvedValue("A flexible strength plan.");

        const result = await workoutPlanService.generateWorkoutPlan(11);

        expect(result.id).toBe(48);
        expect(result.exercises).toHaveLength(6);

    });

    test("retrieves plans, details, and completion state", async () => {

        db.execute
            .mockResolvedValueOnce([[
                { id: 3, title: "Plan", exercise_count: "2" },
            ]])
            .mockResolvedValueOnce([[
                { id: 3, title: "Plan" },
            ]])
            .mockResolvedValueOnce([[
                { id: 1, exercise_id: 2, title: "Exercise" },
            ]])
            .mockResolvedValueOnce([{ affectedRows: 1 }]);

        await expect(workoutPlanService.getWorkoutPlans(7)).resolves.toEqual([
            { id: 3, title: "Plan", exercise_count: 2 },
        ]);
        await expect(workoutPlanService.getWorkoutPlanById(7, 3)).resolves.toEqual(
            expect.objectContaining({
                id: 3,
                exercises: [{ id: 1, exercise_id: 2, title: "Exercise" }],
            })
        );
        await expect(workoutPlanService.completeWorkoutPlan(7, 3)).resolves.toBe(true);

    });

    test("returns null when a requested plan does not belong to the user", async () => {

        db.execute.mockResolvedValueOnce([[]]);

        await expect(workoutPlanService.getWorkoutPlanById(7, 3)).resolves.toBeNull();

    });

});
