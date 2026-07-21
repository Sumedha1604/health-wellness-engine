const db = require("../config/db");

async function getExercises(page, limit) {

    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const [exercises] = await db.query(`
        SELECT
            exercise_id,
            title,
            exercise_type,
            body_part,
            equipment,
            difficulty_level,
            rating
        FROM exercises
        ORDER BY title
        LIMIT ${limit}
        OFFSET ${offset}
    `);

    const [[count]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM exercises
    `);

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
