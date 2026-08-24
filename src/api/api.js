import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://classis-backend.onrender.com/api");

const API = axios.create({
  baseURL: API_BASE_URL,
});

//attack token automatically to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
// https://classis-backend.onrender.com/
