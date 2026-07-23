import axios from "axios";

const baseURL = import.meta.env.DEV
  ? (import.meta.env.VITE_BACKEND_LOCAL_URL || "http://localhost:5000")
  : (import.meta.env.VITE_EXPRESS_BACKEND_ONLINE_URL || "http://localhost:5000");

const axiosFetch = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
});

axiosFetch.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosFetch;
