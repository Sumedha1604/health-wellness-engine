const axios = require("axios");
const db = require("../config/db");
const feedbackService = require("./recommendation_feedback.service");


const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

// Future ML recommendations will be integrated here.


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

  const [exerciseFeedback, foodFeedback] = await Promise.all([
    feedbackService.getFeedbackInfluence(userId, "exercise"),
    feedbackService.getFeedbackInfluence(userId, "food"),
  ]);


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



  let aiTip =
    "Great job! Keep maintaining a balanced diet.";


  let topRecommendation =
    "Balanced Nutrition";


  let recommendedFoods = [
    "Chicken Breast",
    "Greek Yogurt",
    "Broccoli",
    "Brown Rice"
  ];



  if (totalProtein < 80) {

    topRecommendation =
      "Increase Protein Intake";


    aiTip =
      "Your protein intake is low today. Include lean protein in your next meal.";


    recommendedFoods = [
      "Chicken Breast",
      "Eggs",
      "Greek Yogurt",
      "Salmon"
    ];

  } else if (totalCalories < calorieTarget) {


    topRecommendation =
      "Increase Daily Calories";


    aiTip =
      "You are below your calorie target. Add a healthy snack or balanced meal.";


    recommendedFoods = [
      "Brown Rice",
      "Oats",
      "Banana",
      "Peanut Butter"
    ];

  }


  const [[topRecommendationFood]] = await db.execute(
    `
    SELECT
      food_id,
      food_name
    FROM foods
    WHERE food_name = ?
    LIMIT 1
    `,
    [recommendedFoods[0]]
  );


  topRecommendation = {
    food_id: topRecommendationFood?.food_id,
    food_name: topRecommendationFood?.food_name || recommendedFoods[0],
  };



  let recommendedExercises = [];
let mlFoodRecommendations = [];


try {

  const exerciseResponse = await axios.get(
    `${ML_SERVICE_URL}/recommendations/hybrid/${userId}`,
    {
      params: {
        fitness_goal: preferences.fitness_goal,
        activity_level: preferences.activity_level,
        feedback: JSON.stringify(exerciseFeedback),
      },
    }
  );


  recommendedExercises = exerciseResponse.data;


} catch (error) {

  console.log(
    "Exercise recommendation service unavailable"
  );

}



try {

let foodId = null;


const foodIdQuery = await db.execute(
  `
  SELECT food_id
  FROM meal_plans
  WHERE user_id = ?
  ORDER BY meal_date DESC
  LIMIT 1
  `,
  [userId]
);


foodId = foodIdQuery[0][0]?.food_id;


// New user fallback
if (!foodId) {
  foodId = 2396;
}


const foodResponse = await axios.get(
  `${ML_SERVICE_URL}/recommendations/food/${foodId}`,
  {
    params: {
      feedback: JSON.stringify(foodFeedback),
    },
  }
);


mlFoodRecommendations = foodResponse.data;


} catch (error) {

  console.log(
    "Food recommendation service unavailable"
  );

}



  return {

    fitness_goal:
      preferences.fitness_goal,


    activity_level:
      preferences.activity_level,


    diet_type:
      preferences.diet_type,


    nutrition_score:
      nutritionScore,


    summary: {

      calories:
        totalCalories,

      protein:
        totalProtein,

      carbohydrates:
        totalCarbs,

      fat:
        totalFat,

      calorie_target:
        calorieTarget,

    },


    top_recommendation:
      topRecommendation,


    ai_tip:
      aiTip,


    recommended_foods:
    mlFoodRecommendations.length > 0
      ? mlFoodRecommendations
      : recommendedFoods,


    recommended_exercises:
      recommendedExercises,

  };

}


module.exports = {
  generateRecommendations,
};
