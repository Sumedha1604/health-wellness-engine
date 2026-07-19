import api from "./api";

export async function getDashboard() {

  const response = await api.get("/dashboard");

  return response.data.data;

}

export async function getTodaySummary() {

  const response = await api.get("/dashboard/today");

  return response.data.data;

}

export async function getRecentMeals() {

  const response = await api.get("/dashboard/recent-meals");

  return response.data.data;

}

export async function getWeeklyCalories() {

  const response = await api.get("/dashboard/weekly-calories");

  return response.data.data;

}