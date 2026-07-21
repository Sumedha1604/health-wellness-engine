import api from "./api";

export async function addExerciseFavorite(exerciseId){
    const response = await api.post("/favorites", {
        exercise_id: exerciseId
    });

    return response.data;
}


export async function removeFavorite(favoriteId){
    const response = await api.delete(
        `/favorites/${favoriteId}`
    );

    return response.data;
}


export async function getFavorites(){
    const response = await api.get("/favorites");

    return response.data.data;
}