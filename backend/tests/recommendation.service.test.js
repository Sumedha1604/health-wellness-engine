jest.mock("../src/config/db", () => ({
    execute: jest.fn(),
}));

jest.mock("axios");

const db = require("../src/config/db");
const axios = require("axios");

const recommendationService = require("../src/services/recommendation.service");

describe("Recommendation service", () => {

    beforeEach(() => {
        db.execute.mockReset();
        axios.post.mockReset();
        axios.get.mockReset();
        axios.post.mockRejectedValue(
            new Error("Content-based ML service unavailable")
        );
        axios.get.mockRejectedValue(
            new Error("Legacy recommendation service unavailable")
        );
    });

    test("uses hybrid ML exercise recommendations when available", async () => {

        db.execute
            .mockResolvedValueOnce([
                [
                    {
                        fitness_goal: "Improve Endurance",
                        activity_level: "Beginner",
                        diet_type: "Balanced",
                    },
                ],
            ])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([
                [
                    {
                        food_id: 123,
                        food_name: "Chicken Breast",
                    },
                ],
            ])
            .mockResolvedValueOnce([
                [
                    {
                        exercise_id: 2176,
                        title: "Slow Jog",
                        body_part: "Quadriceps",
                        equipment: "Body Only",
                        difficulty_level: "Beginner",
                    },
                ],
            ])
            .mockResolvedValueOnce([[]]);

        axios.post.mockResolvedValueOnce({
            data: {
                recommendations: [
                    {
                        exercise_id: 2176,
                        name: "Slow Jog",
                        score: 0.7819,
                    },
                ],
            },
        });

        const result = await recommendationService.generateRecommendations(11);

        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:8000/recommend/hybrid",
            {
                user_id: 11,
                user_profile: {
                    fitness_goal: "Improve Endurance",
                    activity_level: "Beginner",
                    diet_type: "Balanced",
                    feedback: {},
                },
            },
            expect.objectContaining({ timeout: 2000 })
        );
        expect(result.recommended_exercises).toEqual([
            {
                exercise_id: 2176,
                title: "Slow Jog",
                body_part: "Quadriceps",
                equipment: "Body Only",
                difficulty_level: "Beginner",
                score: 0.7819,
                reason: "Matches your Improve Endurance goal and Beginner activity level.",
            },
        ]);
    });

    test("falls back to content-based ML recommendations when hybrid is unavailable", async () => {

        db.execute
            .mockResolvedValueOnce([
                [
                    {
                        fitness_goal: "Improve Endurance",
                        activity_level: "Beginner",
                        diet_type: "Balanced",
                    },
                ],
            ])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([
                [
                    {
                        food_id: 123,
                        food_name: "Chicken Breast",
                    },
                ],
            ])
            .mockResolvedValueOnce([
                [
                    {
                        exercise_id: 2176,
                        title: "Slow Jog",
                        body_part: "Quadriceps",
                        equipment: "Body Only",
                        difficulty_level: "Beginner",
                    },
                ],
            ])
            .mockResolvedValueOnce([[]]);

        axios.post
            .mockRejectedValueOnce(new Error("Hybrid ML service unavailable"))
            .mockResolvedValueOnce({
                data: {
                    recommendations: [
                        {
                            exercise_id: 2176,
                            name: "Slow Jog",
                            score: 0.7819,
                        },
                    ],
                },
            });

        const result = await recommendationService.generateRecommendations(11);

        expect(axios.post).toHaveBeenNthCalledWith(
            1,
            "http://localhost:8000/recommend/hybrid",
            expect.objectContaining({ user_id: 11 }),
            expect.objectContaining({ timeout: 2000 })
        );
        expect(axios.post).toHaveBeenNthCalledWith(
            2,
            "http://localhost:8000/recommend",
            expect.any(Object),
            expect.objectContaining({ timeout: 2000 })
        );
        expect(result.recommended_exercises).toHaveLength(1);
        expect(result.recommended_exercises[0].title).toBe("Slow Jog");
    });

    test("falls back to collaborative ML recommendations when hybrid and content calls fail", async () => {

        const fallbackRecommendations = [
            {
                exercise_id: 101,
                name: "Legacy Cardio Exercise",
                score: 0.7,
            },
        ];

        db.execute
            .mockResolvedValueOnce([
                [
                    {
                        fitness_goal: "Improve Endurance",
                        activity_level: "Beginner",
                        diet_type: "Balanced",
                    },
                ],
            ])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([
                [
                    {
                        food_id: 123,
                        food_name: "Chicken Breast",
                    },
                ],
            ])
            .mockResolvedValueOnce([
                [
                    {
                        exercise_id: 101,
                        title: "Legacy Cardio Exercise",
                        body_part: "Quadriceps",
                        equipment: "Body Only",
                        difficulty_level: "Beginner",
                    },
                ],
            ]);

        axios.post
            .mockResolvedValueOnce({
                data: { recommendations: "invalid" },
            })
            .mockRejectedValueOnce(
                new Error("Content-based ML service unavailable")
            )
            .mockResolvedValueOnce({
                data: { recommendations: fallbackRecommendations },
            });

        const result = await recommendationService.generateRecommendations(11);

        expect(axios.post).toHaveBeenNthCalledWith(
            3,
            "http://localhost:8000/recommend/collaborative",
            { user_id: 11 },
            expect.objectContaining({ timeout: 2000 })
        );
        expect(result.recommended_exercises).toEqual([
            {
                exercise_id: 101,
                title: "Legacy Cardio Exercise",
                body_part: "Quadriceps",
                equipment: "Body Only",
                difficulty_level: "Beginner",
                score: 0.7,
                reason: "Matches your Improve Endurance goal and Beginner activity level.",
            },
        ]);
    });

    test("generateRecommendations throws when preferences are missing", async () => {

        db.execute.mockResolvedValueOnce([[]]);

        await expect(
            recommendationService.generateRecommendations(11)
        ).rejects.toThrow("Preferences not found");

        expect(db.execute).toHaveBeenCalledTimes(1);

    });

    test("generateRecommendations prioritizes protein for a weight loss plan", async () => {

        db.execute
            .mockResolvedValueOnce([
                [
                    {
                        fitness_goal: "Weight Loss",
                        activity_level: "Intermediate",
                        diet_type: "Balanced",
                    },
                ],
            ])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([
                [
                    {
                        food_name: "Tofu Bowl",
                        caloric_value: 400,
                        protein: 30,
                        carbohydrates: 25,
                        fat: 90,
                        quantity: 1,
                    },
                ],
            ])
            .mockResolvedValueOnce([
                [
                    {
                        food_id: 123,
                        food_name: "Chicken Breast",
                    },
                ],
            ]);

        const result = await recommendationService.generateRecommendations(11);

        expect(result.fitness_goal).toBe("Weight Loss");
        expect(result.summary.calorie_target).toBe(1800);
        expect(result.top_recommendation).toEqual({
            food_id: 123,
            food_name: "Chicken Breast",
        });
        expect(result.ai_tip).toContain("protein intake is low");
        expect(result.recommended_foods).toEqual([
            "Chicken Breast",
            "Eggs",
            "Greek Yogurt",
            "Salmon",
        ]);
        expect(result.nutrition_score).toBe(50);

    });

    test("generateRecommendations recommends extra calories for a default goal", async () => {

        db.execute
            .mockResolvedValueOnce([
                [
                    {
                        fitness_goal: "Maintenance",
                        activity_level: "Intermediate",
                        diet_type: "Balanced",
                    },
                ],
            ])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([
                [
                    {
                        food_name: "Chicken Rice Bowl",
                        caloric_value: 300,
                        protein: 45,
                        carbohydrates: 20,
                        fat: 10,
                        quantity: 2,
                    },
                ],
            ])
            .mockResolvedValueOnce([
                [
                    {
                        food_id: 456,
                        food_name: "Brown Rice",
                    },
                ],
            ]);

        const result = await recommendationService.generateRecommendations(11);

        expect(result.fitness_goal).toBe("Maintenance");
        expect(result.summary.calorie_target).toBe(2200);
        expect(result.summary.calories).toBe(600);
        expect(result.top_recommendation).toEqual({
            food_id: 456,
            food_name: "Brown Rice",
        });
        expect(result.ai_tip).toContain("calorie target");
        expect(result.recommended_foods).toEqual([
            "Brown Rice",
            "Oats",
            "Banana",
            "Peanut Butter",
        ]);

    });

});
