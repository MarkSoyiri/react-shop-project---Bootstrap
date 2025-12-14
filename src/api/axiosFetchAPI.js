import axios from "axios";

const axiosFetch = axios.create({
  baseURL: "https://express-js-on-vercel-liart-chi.vercel.app/",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  
});

axiosFetch.interceptors.request.use(function (config) {  
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
//   { synchronous: true, runWhen: () => /* This function returns true */}
);
  

export default axiosFetch;