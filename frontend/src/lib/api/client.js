import axios from 'axios';
import { storage, SESSION_STORAGE_KEY } from '@/lib/storage.js';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const session = storage.get(SESSION_STORAGE_KEY);
  if (session?.tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${session.tokens.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.remove(SESSION_STORAGE_KEY);
      window.dispatchEvent(new Event('hermes:session-expired'));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
