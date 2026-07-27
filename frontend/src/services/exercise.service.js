import api from "./api";

export async function getExercises(params = {}) {

  const response = await api.get(
    "/exercises",
    { params }
  );

  return response.data.data;

}


export async function getExerciseById(exerciseId) {

  const response = await api.get(
    `/exercises/${exerciseId}`
  );

  return response.data.data;

}
