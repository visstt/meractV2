import { create } from "zustand";
import { persist } from "zustand/middleware";

// Константы для localStorage
const AUTH_STORAGE_KEY = "meract-auth";

// Создаем стор с persist middleware для автоматического сохранения в localStorage
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Состояние
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      location: null, // { latitude, longitude, timestamp }
      routeDestination: null, // { latitude, longitude }
      routeCoordinates: null, // array of [lat, lng] pairs
      routePoints: [], // array of { latitude, longitude, order }

      // Действия
      setUser: (userData) => {
        set({
          user: userData.user || userData,
          token: userData.token || userData.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setLocation: (locationData) => {
        set({
          location: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timestamp: Date.now(),
          },
        });
      },

      setRouteDestination: (destination) => {
        set({
          routeDestination: destination
            ? {
                latitude: destination.latitude,
                longitude: destination.longitude,
              }
            : null,
        });
      },

      setRouteCoordinates: (coordinates) => {
        set({
          routeCoordinates: coordinates ? [...coordinates] : null,
        });
      },

      clearRoute: () => {
        set({
          routeDestination: null,
          routeCoordinates: null,
          routePoints: [],
        });
      },

      addRoutePoint: (point) => {
        const currentPoints = get().routePoints;
        const newPoint = {
          latitude: point.latitude,
          longitude: point.longitude,
          order: currentPoints.length, // Автоматически присваиваем порядковый номер
        };
        set({
          routePoints: [...currentPoints, newPoint],
        });
      },

      removeRoutePoint: (order) => {
        const currentPoints = get().routePoints;
        const filteredPoints = currentPoints.filter((p) => p.order !== order);
        // Переиндексируем точки после удаления
        const reindexedPoints = filteredPoints.map((p, index) => ({
          ...p,
          order: index,
        }));
        set({
          routePoints: reindexedPoints,
        });
      },

      clearRoutePoints: () => {
        set({
          routePoints: [],
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setToken: (newToken) => {
        set({ token: newToken });
        // Также обновляем токен в localStorage
        if (newToken) {
          localStorage.setItem("authToken", newToken);
        }
      },

      login: (userData) => {
        // Сохраняем данные пользователя и токен
        set({
          user: userData.user || userData,
          token: userData.token || userData.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // Дополнительно сохраняем токен в localStorage для API запросов
        if (userData.token || userData.accessToken) {
          localStorage.setItem(
            "authToken",
            userData.token || userData.accessToken,
          );
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Очищаем токен из localStorage
        localStorage.removeItem("authToken");
      },

      // Проверка аутентификации
      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && state.token;
      },

      // Получение токена для API запросов
      getToken: () => {
        const state = get();
        return state.token || localStorage.getItem("authToken");
      },

      // Обновление данных пользователя
      updateUser: (updatedData) => {
        const state = get();
        if (state.user) {
          set({
            user: { ...state.user, ...updatedData },
          });
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY, // ключ для localStorage
      // Настройки persist
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        location: state.location,
      }),
      // Версия стора для миграций
      version: 1,
    },
  ),
);

// Селекторы для удобного использования
export const selectUser = (state) => state.user;
export const selectIsAuthenticated = (state) => state.isAuthenticated;
export const selectToken = (state) => state.token;
export const selectIsLoading = (state) => state.isLoading;
export const selectLocation = (state) => state.location;
