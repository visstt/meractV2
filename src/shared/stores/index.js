// Экспорт стора для прямого использования вне React компонентов
export { useAuthStore } from "./authStore";
export { useSequelStore } from "./sequelStore";

// Утилиты для работы с localStorage напрямую (если понадобится)
export const authStorageUtils = {
  // Получить данные из localStorage
  getStoredAuth: () => {
    try {
      const stored = localStorage.getItem("meract-auth");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Очистить данные из localStorage
  clearStoredAuth: () => {
    localStorage.removeItem("meract-auth");
    localStorage.removeItem("authToken");
  },

  // Проверить есть ли токен
  hasToken: () => {
    const stored = authStorageUtils.getStoredAuth();
    return !!(stored?.state?.token || localStorage.getItem("authToken"));
  },
};
