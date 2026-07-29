import api from "./api";

export const EXERCISE_LOGGED_EVENT = "exercise-logged";
export const NUTRITION_UPDATED_EVENT = "nutrition-updated";

export async function logExercise(
  exerciseId,
  durationMinutes = 30,
  caloriesBurned = 200
) {

  const response = await api.post(
    "/tracking/exercise",
    {
      exercise_id: exerciseId,
      duration_minutes: durationMinutes,
      calories_burned: caloriesBurned,
    }
  );

  window.dispatchEvent(new Event(EXERCISE_LOGGED_EVENT));

  return response.data.data;

}

export async function addWater(amountMl) {

  const response = await api.post(
    "/tracking/water",
    {
      amount_ml: amountMl,
    }
  );

  return response.data.data;

}


export async function getTodayWater() {

  const response = await api.get(
    "/tracking/water/today"
  );

  return response.data.data;

}


export async function getTodayExercises() {

  const response = await api.get(
    "/tracking/exercise/today"
  );

  return response.data.data;

}


export async function getTodayNutrition() {

  const response = await api.get(
    "/tracking/nutrition/today"
  );

  return response.data.data;

}
