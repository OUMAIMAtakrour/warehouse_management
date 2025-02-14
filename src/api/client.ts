import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://192.168.9.31:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});
