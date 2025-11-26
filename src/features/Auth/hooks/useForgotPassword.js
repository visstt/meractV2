import { useState } from "react";

import api from "../../../../shared/api/api";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(email) {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setLoading(false);
      return true;
    } catch (e) {
      setError(e?.response?.data?.message || "Network error");
      setLoading(false);
      return false;
    }
  }

  return { sendCode, loading, error };
}
