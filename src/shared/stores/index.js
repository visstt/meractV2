// Export store for direct use outside React components
export { useAuthStore } from "./authStore";
export { useSequelStore } from "./sequelStore";

// Utilities for working with localStorage directly (if needed)
export const authStorageUtils = {
  getStoredAuth: () => {
    try {
      const stored = localStorage.getItem("meract-auth");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Clear data from localStorage
  clearStoredAuth: () => {
    localStorage.removeItem("meract-auth");
    localStorage.removeItem("authToken");
  },

  // Check if token exists
  hasToken: () => {
    const stored = authStorageUtils.getStoredAuth();
    return !!(stored?.state?.token || localStorage.getItem("authToken"));
  },
};
