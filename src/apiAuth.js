import axios from "axios";
import { ACCESS_TOKEN } from "./constants";



const csrfToken = document.querySelector('meta[name="csrf-token"]');
const AUTH_TOKEN = localStorage.getItem(ACCESS_TOKEN);

const apiAuth = axios.create({

  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers:{
 'Content-Type':'application/json',
 'Authorization':`Bearer ${AUTH_TOKEN}`,
 'Accept': "application/json",
 'X-CSRFToken': csrfToken,
    }
 
  
});



apiAuth.interceptors.request.use(
  (config) => {
    
    return config;

  },
  (error) => {

    return Promise.reject(error);

  }
);

export default apiAuth;
