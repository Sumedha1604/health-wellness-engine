import api from "./api";

export async function addFavorite(data) {
    const response = await api.post(
      "/favorites",
      data
    );
  
    return response.data;
  }
  
export async function getFavorites() {
  const response = await api.get("/favorites");

  return response.data.data;
}

export async function deleteFavorite(favoriteId) {
  const response = await api.delete(
    `/favorites/${favoriteId}`
  );

  return response.data;
}