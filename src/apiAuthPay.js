import axios from "axios";


const csrfToken = document.querySelector('meta[name="csrf-token"]');
const PAYMENT_TOKEN = import.meta.env.YOUR_SECRET_KEY; 


const apiAuthPay = axios.create({
  baseURL: import.meta.env.PAYMENT_URL,
  timeout: 10000,
  headers:{
 'Content-Type':'application/json',
 'Authorization':`Bearer ${PAYMENT_TOKEN}`,
 'Accept': "application/json",
 'X-CSRFToken': csrfToken,
    }
 
  
});



apiAuthPay.interceptors.request.use(
  (config) => { 
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default apiAuthPay;