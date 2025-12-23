
import axios from "axios";

const axiosapi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    // Headers removed to allow axios to handle Content-Type (e.g. for FormData)
});

export default axiosapi;
