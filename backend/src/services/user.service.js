const db = require("../config/db");

async function getUserProfile(userId) {
  const [rows] = await db.execute(
    `
    SELECT
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      u.gender,
      p.fitness_goal,
      p.activity_level,
      p.diet_type,
      p.height_cm,
      p.weight_kg,
      p.sleep_hours,
      p.stress_level
    FROM users u
    LEFT JOIN preferences p
      ON u.user_id = p.user_id
    WHERE u.user_id = ?
    `,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error("User not found");
  }

  return rows[0];
}

module.exports = {
  getUserProfile,
};