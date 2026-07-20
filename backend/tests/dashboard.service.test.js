jest.mock("../src/config/db", () => ({
    execute: jest.fn(),
}));

const db = require("../src/config/db");

const dashboardService = require("../src/services/dashboard.service");

describe("Dashboard service", () => {

    beforeEach(() => {
        db.execute.mockReset();
    });

    test("getRecentMeals returns the latest meal rows", async () => {

        const recentMeals = [
            {
                meal_plan_id: 12,
                meal_type: "Lunch",
                quantity: 2,
                meal_date: "2026-07-20",
                food_name: "Grilled Chicken",
                caloric_value: 320,
            },
        ];

        db.execute.mockResolvedValueOnce([recentMeals]);

        const result = await dashboardService.getRecentMeals(7);

        expect(db.execute).toHaveBeenCalledWith(
            expect.stringContaining("LIMIT 5"),
            [7]
        );

        expect(result).toEqual(recentMeals);

    });

    test("getWeeklyCalories maps returned calories across the week", async () => {

        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-07-20T12:00:00Z"));

        db.execute.mockResolvedValueOnce([
            [
                {
                    meal_date: "2026-07-18",
                    calories: "450",
                },
            ],
        ]);

        const result = await dashboardService.getWeeklyCalories(7);

        expect(db.execute).toHaveBeenCalledWith(
            expect.stringContaining("DATE_SUB"),
            [7]
        );

        expect(result).toHaveLength(7);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    calories: 450,
                }),
            ])
        );
        expect(result.some((entry) => entry.calories === 0)).toBe(true);

        jest.useRealTimers();

    });

});