import api from "./api";

export async function generateWorkoutPlan() {

  const response = await api.post("/workout-plans/generate");

  return response.data.data;

}

export async function getWorkoutPlans() {

  const response = await api.get("/workout-plans");

  return response.data.data;

}

export async function getWorkoutPlanById(id) {

  const response = await api.get(`/workout-plans/${id}`);

  return response.data.data;

}

export async function completeWorkoutPlan(id) {

  const response = await api.post(`/workout-plans/${id}/complete`);

  return response.data;

}
