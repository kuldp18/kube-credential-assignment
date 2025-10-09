import axios from "axios";

const apiClient = axios.create({
  baseURL: "/", //using absolute path in vite proxy
});

export default apiClient;
