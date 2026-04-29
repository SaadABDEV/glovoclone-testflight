import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const api = axios.create({ baseURL });

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
