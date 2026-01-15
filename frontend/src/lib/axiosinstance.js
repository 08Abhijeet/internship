import axios from "axios";
const axiosInstance = axios.create({
  baseURL: process.env.BACKEND_URL || "http://localhost:4000", // Added fallback URL
});
export default axiosInstance;
