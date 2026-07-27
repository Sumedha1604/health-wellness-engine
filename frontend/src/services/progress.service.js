import api from "./api";

function logProgressError(endpoint, error) {

  console.error(`Progress API request failed: ${endpoint}`, {
    status: error.response?.status,
    message: error.response?.data?.message || error.message,
    response: error.response?.data,
  });

}

export async function getProgressOverview() {

  try {
    const response = await api.get("/progress/overview");

    return response.data.data;
  } catch (error) {
    logProgressError("/progress/overview", error);
    throw error;
  }

}

export async function getProgressHistory() {

  try {
    const response = await api.get("/progress/history");

    return response.data.data;
  } catch (error) {
    logProgressError("/progress/history", error);
    throw error;
  }

}
