import axios from "axios";
const axiosInstance = axios.create({
  baseURL: process.env.BACKEND_URL, // Added fallback URL
});
export default axiosInstance;
