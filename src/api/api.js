import axios from 'axios';

const API = axios.create({
    baseURL: "https://classis-backend.onrender.com/api"
})

export default API;