import { useState } from "react";

import api from "../../../../shared/api/api";
import { useAuthStore } from "../../../../shared/stores/authStore";

export function useSignUp() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login, setLoading, isLoading } = useAuthStore();

  async function signUp(email, password) {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await api.post("/auth/sign-up", { email, password });

      // If registration returns user data and token,
      // save them to the store (optional)
      if (res.data && (res.data.token || res.data.user)) {
        login(res.data);
      }

      setSuccess(true);
      setLoading(false);
      return true;
    } catch (e) {
      setError(e?.response?.data?.message || "Network error");
      setLoading(false);
      return false;
    }
  }

  return { signUp, loading: isLoading, error, success };
}
