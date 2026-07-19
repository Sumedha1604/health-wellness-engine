const db = require("../config/db");

async function savePreferences(userId, data) {
    const {
        fitness_goal,
        activity_level,
        diet_type,
        height_cm,
        weight_kg,
        sleep_hours,
        stress_level,
    } = data;

    const [existing] = await db.execute(
        `SELECT preference_id
         FROM preferences
         WHERE user_id = ?
         LIMIT 1`,
        [userId]
    );

    if (existing.length) {
        await db.execute(
            `UPDATE preferences
             SET
                fitness_goal = ?,
                activity_level = ?,
                diet_type = ?,
                height_cm = ?,
                weight_kg = ?,
                sleep_hours = ?,
                stress_level = ?
             WHERE user_id = ?`,
            [
                fitness_goal,
                activity_level,
                diet_type,
                height_cm,
                weight_kg,
                sleep_hours,
                stress_level,
                userId,
            ]
        );

        return {
            message: "Preferences updated successfully",
        };
    }

    await db.execute(
        `INSERT INTO preferences
        (
            user_id,
            fitness_goal,
            activity_level,
            diet_type,
            height_cm,
            weight_kg,
            sleep_hours,
            stress_level
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            userId,
            fitness_goal,
            activity_level,
            diet_type,
            height_cm,
            weight_kg,
            sleep_hours,
            stress_level,
        ]
    );

    return {
        message: "Preferences saved successfully",
    };
}

async function getPreferences(userId) {
    const [rows] = await db.execute(
        `SELECT
            fitness_goal,
            activity_level,
            diet_type,
            height_cm,
            weight_kg,
            sleep_hours,
            stress_level
         FROM preferences
         WHERE user_id = ?
         ORDER BY preference_id DESC
         LIMIT 1`,
        [userId]
    );

    return rows.length ? rows[0] : null;
}

module.exports = {
    savePreferences,
    getPreferences,
};