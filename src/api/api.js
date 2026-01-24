import axios from "axios";

const API = axios.create({
  baseURL: "https://classis-backend.onrender.com/api"
  // baseURL: "http://localhost:5000/api",
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