import { useState } from "react";

import api from "../../../../shared/api/api";
import { useAuthStore } from "../../../../shared/stores/authStore";

export function useAuth() {
  const [error, setError] = useState(null);
  const { login, setLoading, logout, isLoading, isAuthenticated, user } =
    useAuthStore();

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/sign-in", { email, password });

      login(res.data);

      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Auth error");
      setLoading(false);
      return null;
    }
  };

  const signOut = () => {
    logout();
    setError(null);
  };

  return {
    signIn,
    signOut,
    loading: isLoading,
    error,
    isAuthenticated,
    user,
  };
}
