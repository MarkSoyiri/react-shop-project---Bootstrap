import axios from "axios";

const fetch = axios.create({
  baseURL: 'https://express-and-react.vercel.app/',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});

// Add a request interceptor
fetch.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
 
);

export default fetch;  

