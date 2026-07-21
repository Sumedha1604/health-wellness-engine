const db = require("../config/db");

async function getExercises(page, limit, filters = {}) {

    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const {
        search,
        body_part,
        equipment,
        difficulty,
    } = filters;

    const conditions = [];
    const params = [];

    if (search) {
        conditions.push(
            `(title LIKE ? OR body_part LIKE ? OR equipment LIKE ?)`
        );

        const likeValue = `%${search}%`;

        params.push(likeValue, likeValue, likeValue);
    }

    if (body_part && body_part !== "All") {
        conditions.push(`body_part = ?`);
        params.push(body_part);
    }

    if (equipment && equipment !== "All") {
        conditions.push(`equipment = ?`);
        params.push(equipment);
    }

    if (difficulty && difficulty !== "All") {
        conditions.push(`difficulty_level = ?`);
        params.push(difficulty);
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const [exercises] = await db.query(
        `
        SELECT
            exercise_id,
            title,
            exercise_type,
            body_part,
            equipment,
            difficulty_level,
            rating
        FROM exercises
        ${whereClause}
        ORDER BY title
        LIMIT ${limit}
        OFFSET ${offset}
        `,
        params
    );

    const [[count]] = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM exercises
        ${whereClause}
        `,
        params
    );

    return {
        page,
        limit,
        total: count.total,
        data: exercises,
    };
}


async function getExerciseById(exerciseId) {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM exercises
        WHERE exercise_id = ?
        `,
        [exerciseId]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}


module.exports = {
    getExercises,
    getExerciseById,
};