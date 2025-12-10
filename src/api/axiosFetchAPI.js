import axios from "axios";

const axiosFetch = axios.create({
  baseURL: "http://localhost:5000/",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  
});

axios.interceptors.request.use(function (config) {  
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
//   { synchronous: true, runWhen: () => /* This function returns true */}
);


export default axiosFetch;