import api from "./api";

export async function searchFoods(name) {

  const response = await api.get(
    "/foods/search",
    {
      params: {
        name,
      },
    }
  );

  return response.data.data;

}

export async function getFoods() {

  const response = await api.get(
    "/foods"
  );

  return response.data.data.data;

}