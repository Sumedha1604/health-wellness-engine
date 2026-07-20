jest.mock("../src/config/db", () => ({
    execute: jest.fn(),
}));

const db = require("../src/config/db");

const favoriteService = require("../src/services/favorite.service");

describe("Favorite service", () => {

    beforeEach(() => {
        db.execute.mockReset();
    });

    test("addFavorite requires exactly one favorite target", async () => {

        await expect(
            favoriteService.addFavorite(1, {})
        ).rejects.toThrow(
            "food_id, exercise_id, or meal_plan_id is required."
        );

        expect(db.execute).not.toHaveBeenCalled();

    });

    test("addFavorite rejects multiple favorite targets", async () => {

        await expect(
            favoriteService.addFavorite(1, {
                food_id: 10,
                exercise_id: 20,
            })
        ).rejects.toThrow(
            "Provide only one of food_id, exercise_id, or meal_plan_id."
        );

        expect(db.execute).not.toHaveBeenCalled();

    });

    test("addFavorite accepts an exercise favorite", async () => {

        db.execute.mockResolvedValueOnce([
            {
                insertId: 88,
            },
        ]);

        const result = await favoriteService.addFavorite(3, {
            exercise_id: 27,
        });

        expect(db.execute).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO favorites"),
            [3, 27, null, null]
        );

        expect(result).toEqual({
            message: "Favorite added successfully.",
            favorite_id: 88,
        });

    });

    test("deleteFavorite throws when the favorite is missing", async () => {

        db.execute.mockResolvedValueOnce([
            {
                affectedRows: 0,
            },
        ]);

        await expect(
            favoriteService.deleteFavorite(4, 99)
        ).rejects.toMatchObject({
            message: "Favorite not found",
            statusCode: 404,
        });

        expect(db.execute).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM favorites"),
            [99, 4]
        );

    });

});