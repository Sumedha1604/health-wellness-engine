const db = require("../config/db");

async function generateRecommendations(userId) {

  const [[preferences]] = await db.execute(
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

  if (!preferences) {
    throw new Error("Preferences not found");
  }

  const [meals] = await db.execute(
    `
    SELECT
      f.food_name,
      f.caloric_value,
      f.protein,
      f.carbohydrates,
      f.fat,
      mp.quantity
    FROM meal_plans mp
    INNER JOIN foods f
      ON mp.food_id = f.food_id
    WHERE
      mp.user_id = ?
      AND mp.meal_date = CURDATE()
    `,
    [userId]
  );

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  meals.forEach((meal) => {
    totalCalories += Number(meal.caloric_value) * meal.quantity;
    totalProtein += Number(meal.protein) * meal.quantity;
    totalCarbs += Number(meal.carbohydrates) * meal.quantity;
    totalFat += Number(meal.fat) * meal.quantity;
  });

  let calorieTarget = 2200;

  switch (preferences.fitness_goal) {
    case "Muscle Gain":
      calorieTarget = 2800;
      break;

    case "Weight Loss":
      calorieTarget = 1800;
      break;

    default:
      calorieTarget = 2200;
  }

  let nutritionScore = 100;

  if (totalCalories < calorieTarget * 0.7) {
    nutritionScore -= 20;
  }

  if (totalProtein < 80) {
    nutritionScore -= 20;
  }

  if (totalFat > 80) {
    nutritionScore -= 10;
  }

  if (nutritionScore < 0) {
    nutritionScore = 0;
  }

  let aiTip = "Great job! Keep maintaining a balanced diet.";
  let topRecommendation = "Balanced Nutrition";
  let recommendedFoods = [
    "Chicken Breast",
    "Greek Yogurt",
    "Broccoli",
    "Brown Rice"
  ];

  if (totalProtein < 80) {
    topRecommendation = "Increase Protein Intake";
    aiTip = "Your protein intake is low today. Include lean protein in your next meal.";
    recommendedFoods = [
      "Chicken Breast",
      "Eggs",
      "Greek Yogurt",
      "Salmon"
    ];
  } else if (totalCalories < calorieTarget) {
    topRecommendation = "Increase Daily Calories";
    aiTip = "You are below your calorie target. Add a healthy snack or balanced meal.";
    recommendedFoods = [
      "Brown Rice",
      "Oats",
      "Banana",
      "Peanut Butter"
    ];
  }

  return {
    fitness_goal: preferences.fitness_goal,
    activity_level: preferences.activity_level,
    diet_type: preferences.diet_type,

    nutrition_score: nutritionScore,

    summary: {
      calories: totalCalories,
      protein: totalProtein,
      carbohydrates: totalCarbs,
      fat: totalFat,
      calorie_target: calorieTarget,
    },

    top_recommendation: topRecommendation,
    ai_tip: aiTip,
    recommended_foods: recommendedFoods,
  };
}

module.exports = {
  generateRecommendations,
};