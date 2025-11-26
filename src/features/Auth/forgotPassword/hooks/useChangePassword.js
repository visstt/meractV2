import { useState } from "react";

import api from "../../../../shared/api/api";

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function changePassword(userId, password) {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/change-password", { userId, password });
      setLoading(false);
      return true;
    } catch (e) {
      setError(e?.response?.data?.message || "Network error");
      setLoading(false);
      return false;
    }
  }

  return { changePassword, loading, error };
}
