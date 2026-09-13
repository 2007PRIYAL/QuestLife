import axios, { AxiosError } from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AUTH_TOKEN_KEY = 'questlife_token';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

// The backend's error middleware (src/middleware/error.middleware.ts) always
// replies with { success: false, message, errors? }. This pulls a readable
// message out of any Axios error shape so the UI never has to guess.
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: { path: (string | number)[]; message: string }[] }
      | undefined;

    if (data?.errors?.length) {
      return data.errors[0].message;
    }
    if (data?.message) {
      return data.message;
    }
    if (error.code === 'ERR_NETWORK') {
      return "Can't reach the QuestLife server. Is the backend running?";
    }
  }
  return fallback;
};
