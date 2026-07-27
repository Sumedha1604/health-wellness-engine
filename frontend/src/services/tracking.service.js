import api from "./api";

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
