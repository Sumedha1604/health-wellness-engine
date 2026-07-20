jest.mock("../src/config/db", () => ({
    execute: jest.fn(),
}));

const db = require("../src/config/db");

const recommendationService = require("../src/services/recommendation.service");

describe("Recommendation service", () => {

    beforeEach(() => {
        db.execute.mockReset();
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
            ]);

        const result = await recommendationService.generateRecommendations(11);

        expect(result.fitness_goal).toBe("Weight Loss");
        expect(result.summary.calorie_target).toBe(1800);
        expect(result.top_recommendation).toBe("Increase Protein Intake");
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
            ]);

        const result = await recommendationService.generateRecommendations(11);

        expect(result.fitness_goal).toBe("Maintenance");
        expect(result.summary.calorie_target).toBe(2200);
        expect(result.summary.calories).toBe(600);
        expect(result.top_recommendation).toBe("Increase Daily Calories");
        expect(result.ai_tip).toContain("calorie target");
        expect(result.recommended_foods).toEqual([
            "Brown Rice",
            "Oats",
            "Banana",
            "Peanut Butter",
        ]);

    });

});