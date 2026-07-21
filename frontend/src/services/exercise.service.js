import api from "./api";

export async function getExercises(params = {}) {

  const response = await api.get(
    "/exercises",
    { params }
  );

  return response.data.data;

}