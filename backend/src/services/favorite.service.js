const db = require("../config/db");

async function addFavorite(userId, data) {
    const { food_id, exercise_id } = data;

    if (!food_id && !exercise_id) {
        throw new Error("food_id or exercise_id is required.");
    }

    if (food_id && exercise_id) {
        throw new Error("Provide either food_id or exercise_id, not both.");
    }

    const [result] = await db.execute(
        `
        INSERT INTO favorites
        (
            user_id,
            exercise_id,
            food_id
        )
        VALUES (?, ?, ?)
        `,
        [
            userId,
            exercise_id || null,
            food_id || null
        ]
    );

    return {
        message: "Favorite added successfully.",
        favorite_id: result.insertId
    };
}

async function getFavorites(userId) {

    const [favorites] = await db.execute(
        `
        SELECT
            f.favorite_id,
            fd.food_id,
            fd.food_name,
            fd.caloric_value
        FROM favorites f
        LEFT JOIN foods fd
            ON f.food_id = fd.food_id
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