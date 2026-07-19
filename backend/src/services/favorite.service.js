const db = require("../config/db");

async function addFavorite(userId, data) {
    const {
        food_id,
        exercise_id,
        meal_plan_id,
    } = data;

    const count =
        Boolean(food_id) +
        Boolean(exercise_id) +
        Boolean(meal_plan_id);

    if (count === 0) {
        throw new Error(
            "food_id, exercise_id, or meal_plan_id is required."
        );
    }

    if (count > 1) {
        throw new Error(
            "Provide only one of food_id, exercise_id, or meal_plan_id."
        );
    }

    const [result] = await db.execute(
        `
        INSERT INTO favorites
        (
            user_id,
            exercise_id,
            food_id,
            meal_plan_id
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            exercise_id || null,
            food_id || null,
            meal_plan_id || null,
        ]
    );

    return {
        message: "Favorite added successfully.",
        favorite_id: result.insertId,
    };
}

async function getFavorites(userId) {

    const [favorites] = await db.execute(
        `
        SELECT
            f.favorite_id,

            fd.food_id,
            fd.food_name,
            fd.caloric_value,

            mp.meal_plan_id,
            mp.meal_type,
            mp.meal_date,
            mp.quantity

        FROM favorites f

        LEFT JOIN foods fd
            ON f.food_id = fd.food_id

        LEFT JOIN meal_plans mp
            ON f.meal_plan_id = mp.meal_plan_id

        WHERE f.user_id = ?
        `,
        [userId]
    );

    return favorites;
}

async function deleteFavorite(userId, favoriteId) {

    const [result] = await db.execute(
        `
        DELETE FROM favorites
        WHERE
            favorite_id = ?
            AND user_id = ?
        `,
        [
            favoriteId,
            userId,
        ]
    );

    if (result.affectedRows === 0) {

        const error = new Error("Favorite not found");

        error.statusCode = 404;

        throw error;

    }

    return {
        message: "Favorite deleted successfully.",
    };

}

module.exports = {
    addFavorite,
    getFavorites,
    deleteFavorite,
};