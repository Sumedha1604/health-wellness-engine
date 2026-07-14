import api from "./api";

export async function getMealPlans() {

  const response = await api.get(
    "/meal-plans"
  );

  return response.data.data;

}

export async function getMealPlanById(id) {

  const response = await api.get(
    `/meal-plans/${id}`
  );

  return response.data.data;

}

export async function createMealPlan(data) {

  const response = await api.post(
    "/meal-plans",
    data
  );

  return response.data.data;

}

export async function updateMealPlan(id, data) {

  const response = await api.put(
    `/meal-plans/${id}`,
    data
  );

  return response.data;

}

export async function deleteMealPlan(id) {

  const response = await api.delete(
    `/meal-plans/${id}`
  );

  return response.data;

}