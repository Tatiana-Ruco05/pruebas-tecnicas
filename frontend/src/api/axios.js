import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const isLoginRequest = error.config?.url === "/auth/login";
    const hasSession = Boolean(localStorage.getItem("token"));
    const sessionExpired = status === 401;
    const userWasDeactivated =
      status === 403 && message === "El usuario está inactivo";

    if (
      hasSession &&
      !isLoginRequest &&
      (sessionExpired || userWasDeactivated)
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      if (window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
