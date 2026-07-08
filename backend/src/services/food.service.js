const db = require("../config/db");

async function getFoods(page, limit) {
    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const [foods] = await db.query(`
        SELECT
            food_id,
            food_name,
            caloric_value,
            protein,
            carbohydrates,
            fat
        FROM foods
        ORDER BY food_name
        LIMIT ${limit}
        OFFSET ${offset}
    `);

    const [[count]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM foods
    `);

    return {
        page,
        limit,
        total: count.total,
        data: foods,
    };
}

async function getFoodById(foodId) {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM foods
        WHERE food_id = ?
        `,
        [foodId]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}

async function searchFoods(name) {

    if (!name || name.trim() === "") {
        return [];
    }

    const [foods] = await db.execute(
        `
        SELECT
            food_id,
            food_name,
            caloric_value,
            protein,
            carbohydrates,
            fat
        FROM foods
        WHERE food_name LIKE ?
        ORDER BY food_name
        LIMIT 20
        `,
        [`%${name}%`]
    );

    return foods;
}

module.exports = {
    getFoods,
    getFoodById,
    searchFoods,
};