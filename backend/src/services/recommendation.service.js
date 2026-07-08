const db = require("../config/db");

async function generateRecommendations(userId) {
  const [rows] = await db.execute(
    `
    SELECT
      fitness_goal,
      activity_level,
      diet_type
    FROM preferences
    WHERE user_id = ?
    `,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error("Preferences not found");
  }

  const preferences = rows[0];

  let daily_calories = 2200;
  let recommended_workouts = [];
  let recommended_foods = [];

  switch (preferences.fitness_goal) {
    case "Muscle Gain":
      daily_calories = 2800;
      recommended_workouts = [
        "Bench Press",
        "Squats",
        "Deadlifts",
        "Pull Ups"
      ];
      recommended_foods = [
        "Chicken Breast",
        "Eggs",
        "Brown Rice",
        "Greek Yogurt"
      ];
      break;

    case "Weight Loss":
      daily_calories = 1800;
      recommended_workouts = [
        "Running",
        "Cycling",
        "HIIT",
        "Jump Rope"
      ];
      recommended_foods = [
        "Oats",
        "Salad",
        "Grilled Fish",
        "Apple"
      ];
      break;

    default:
      daily_calories = 2200;
      recommended_workouts = [
        "Walking",
        "Swimming",
        "Yoga"
      ];
      recommended_foods = [
        "Vegetables",
        "Whole Grains",
        "Fruits"
      ];
  }

  return {
    fitness_goal: preferences.fitness_goal,
    activity_level: preferences.activity_level,
    diet_type: preferences.diet_type,
    daily_calories,
    recommended_workouts,
    recommended_foods,
  };
}

module.exports = {
  generateRecommendations,
};