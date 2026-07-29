const axios = require("axios");
const db = require("../config/db");
const feedbackService = require("./recommendation_feedback.service");


const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

const ML_SERVICE_TIMEOUT = 2000;


function logMlServiceFailure(label, url, error) {

  console.warn(`${label} ML service request failed.`, {
    url,
    status: error.response?.status || null,
    response: error.response?.data || null,
    message: error.message,
  });

}


function isValidMlResponse(response) {

  return Array.isArray(response?.data?.recommendations)
    && response.data.recommendations.every((recommendation) => (
      Number.isInteger(Number(recommendation.exercise_id))
      && typeof recommendation.name === "string"
      && Number.isFinite(Number(recommendation.score))
    ));

}


async function getHybridMlExerciseRecommendations(
  userId,
  preferences,
  exerciseFeedback
) {

  const response = await axios.post(
    `${ML_SERVICE_URL}/recommend/hybrid`,
    {
      user_id: userId,
      user_profile: {
        fitness_goal: preferences.fitness_goal,
        activity_level: preferences.activity_level,
        diet_type: preferences.diet_type,
        feedback: exerciseFeedback,
      },
    },
    {
      timeout: ML_SERVICE_TIMEOUT,
    }
  );

  if (!isValidMlResponse(response)) {
    throw new Error("Invalid hybrid ML recommendation response");
  }

  return response.data.recommendations;

}


async function getContentMlExerciseRecommendations(preferences, exerciseFeedback) {

  const response = await axios.post(
    `${ML_SERVICE_URL}/recommend`,
    {
      user_profile: {
        fitness_goal: preferences.fitness_goal,
        activity_level: preferences.activity_level,
        diet_type: preferences.diet_type,
        feedback: exerciseFeedback,
      },
    },
    {
      timeout: ML_SERVICE_TIMEOUT,
    }
  );

  if (!isValidMlResponse(response)) {
    throw new Error("Invalid ML recommendation response");
  }

  return response.data.recommendations;

}


async function formatMlExerciseRecommendations(
  mlRecommendations,
  preferences
) {

  if (mlRecommendations.length === 0) {
    return [];
  }

  const exerciseIds = mlRecommendations.map(
    (recommendation) => Number(recommendation.exercise_id)
  );
  const placeholders = exerciseIds.map(() => "?").join(", ");
  const [exercises] = await db.execute(
    `
    SELECT
      exercise_id,
      title,
      body_part,
      equipment,
      difficulty_level
    FROM exercises
    WHERE exercise_id IN (${placeholders})
    `,
    exerciseIds
  );
  const exercisesById = new Map(
    exercises.map((exercise) => [Number(exercise.exercise_id), exercise])
  );

  return mlRecommendations.map((recommendation) => {
    const exerciseId = Number(recommendation.exercise_id);
    const exercise = exercisesById.get(exerciseId);

    return {
      exercise_id: exerciseId,
      title: exercise?.title || recommendation.name,
      body_part: exercise?.body_part || "Not specified",
      equipment: exercise?.equipment || "Not specified",
      difficulty_level: exercise?.difficulty_level || preferences.activity_level,
      score: Number(recommendation.score),
      reason: recommendation.reason || (
        `Recommended because it matches your ${preferences.fitness_goal} goal ` +
        `and ${preferences.activity_level} activity level.`
      ),
    };
  });

}


async function getLegacyExerciseRecommendations(
  userId,
  preferences,
  exerciseFeedback
) {

  const response = await axios.post(
    `${ML_SERVICE_URL}/recommend/collaborative`,
    {
      user_id: userId,
    },
    {
      timeout: ML_SERVICE_TIMEOUT,
    }
  );

  if (!isValidMlResponse(response)) {
    throw new Error("Invalid collaborative ML recommendation response");
  }

  return response.data.recommendations;

}


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
    reason: totalProtein < 80
      ? "Recommended because it supports your protein target and diet preference."
      : "Recommended because it supports your daily nutrition needs and diet preference.",
  };



  let recommendedExercises = [];
let mlFoodRecommendations = [];


try {

  const mlRecommendations = await getHybridMlExerciseRecommendations(
    userId,
    preferences,
    exerciseFeedback
  );

  recommendedExercises = await formatMlExerciseRecommendations(
    mlRecommendations,
    preferences
  );


} catch (error) {

  logMlServiceFailure(
    "Hybrid exercise recommendation",
    `${ML_SERVICE_URL}/recommend/hybrid`,
    error
  );

  try {

    const contentRecommendations = await getContentMlExerciseRecommendations(
      preferences,
      exerciseFeedback
    );

    recommendedExercises = await formatMlExerciseRecommendations(
      contentRecommendations,
      preferences
    );

  } catch (contentError) {

    logMlServiceFailure(
      "Content-based exercise recommendation",
      `${ML_SERVICE_URL}/recommend`,
      contentError
    );

    try {

      const collaborativeRecommendations = await getLegacyExerciseRecommendations(
        userId,
        preferences,
        exerciseFeedback
      );

      recommendedExercises = await formatMlExerciseRecommendations(
        collaborativeRecommendations,
        preferences
      );

    } catch (fallbackError) {

      logMlServiceFailure(
        "Collaborative exercise recommendation",
        `${ML_SERVICE_URL}/recommend/collaborative`,
        fallbackError
      );

    }
  }

}



let foodId = null;

try {

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

  logMlServiceFailure(
    "Food recommendation",
    `${ML_SERVICE_URL}/recommendations/food/${foodId}`,
    error
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
      : recommendedFoods.map((food_name) => ({
        food_name,
        reason: "Recommended because it fits your current nutrition needs and diet preference.",
      })),


    recommended_exercises:
      recommendedExercises,

  };

}


module.exports = {
  generateRecommendations,
};
