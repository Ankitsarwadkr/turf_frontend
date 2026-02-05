import axios from "axios";
console.log("API BASE :", import.meta.env.VITE_API_BASE_URL);
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
});
