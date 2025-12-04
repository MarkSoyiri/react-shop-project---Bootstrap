const axios = require("axios");

axios.create({
    baseURL:process.env.EXPRESS_BACKEND_ONLINE_URL || "http://localhost:5000",
    timeout:10000,
    headers:{
        'Content-Type': 'application/json'
    },
    
})

module.exports = axios