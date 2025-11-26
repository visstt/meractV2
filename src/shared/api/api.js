import axios from "axios";

import { useAuthStore } from "../stores/authStore";

// Флаг для отслеживания процесса обновления токена
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Интерцептор для добавления токена в каждый запрос
api.interceptors.request.use(
  (config) => {
    // Получаем токен из стора
    const token = useAuthStore.getState().getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Интерцептор для обработки ответов с автоматическим обновлением токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Не обрабатываем 401 для самого запроса обновления токена
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      // Если уже идет процесс обновления токена, добавляем запрос в очередь
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Пытаемся обновить токен
        const response = await api.post("/auth/refresh");
        const { token } = response.data;

        // Сохраняем новый токен в стор
        useAuthStore.getState().setToken(token);

        // Обрабатываем очередь запросов
        processQueue(null, token);

        // Обновляем заголовок Authorization в оригинальном запросе
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Повторяем оригинальный запрос с новым токеном
        return api(originalRequest);
      } catch (refreshError) {
        // Обрабатываем очередь с ошибкой
        processQueue(refreshError, null);

        // Если обновление токена тоже вернуло 401, то разлогиниваем
        if (refreshError.response?.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Если это 401 на /auth/refresh, сразу разлогиниваем
    if (
      error.response?.status === 401 &&
      originalRequest.url.includes("/auth/refresh")
    ) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
