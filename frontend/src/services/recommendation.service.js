import api from "./api";


export async function getRecommendations() {

  const response = await api.get(
    "/recommendations"
  );

  return response.data.data;
}


export async function submitRecommendationFeedback(data) {

  const response = await api.post(
    "/recommendations/feedback",
    data
  );

  return response.data.data;

}


export async function getRecommendationFeedback() {

  const response = await api.get(
    "/recommendations/feedback"
  );

  return response.data.data;

}


export async function getRecommendationAnalytics() {

  const response = await api.get(
    "/recommendations/analytics"
  );

  return response.data.data;

}
