import axios from "axios";

const baseURL = (import.meta.env.DEV
  ? (import.meta.env.VITE_BACKEND_LOCAL_URL || "http://localhost:5000")
  : (import.meta.env.VITE_EXPRESS_BACKEND_ONLINE_URL || "http://localhost:5000")).trim();

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

axiosFetch.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosFetch;
