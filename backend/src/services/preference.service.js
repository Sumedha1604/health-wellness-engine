const db = require("../config/db");

async function savePreferences(userId, data) {
  console.log("Entered savePreferences");
  console.log("User ID:", userId);
  console.log("Data:", data);

  const {
    fitness_goal,
    activity_level,
    diet_type,
    height_cm,
    weight_kg,
    sleep_hours,
    stress_level,
  } = data;

  console.log("About to execute INSERT");

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

  console.log("INSERT completed");

  return {
    message: "Preferences saved successfully",
  };
}

module.exports = {
  savePreferences,
};