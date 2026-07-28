import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL;

if (!configuredApiUrl) {
  console.error(
    "Missing VITE_API_URL. Configure the public backend API URL before building for deployment. Requests will use the same-origin /api path."
  );
}

const apiBaseUrl = (configuredApiUrl || "/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});


api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (
      error.response &&
      (error.response.status === 401 ||
       error.response.status === 403)
    ) {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      localStorage.setItem(
        "authMessage",
        "Your session has expired. Please log in again."
      );

      window.location.href = "/login";

    }

    return Promise.reject(error);

  }

);


export default api;
