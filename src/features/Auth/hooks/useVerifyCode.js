import { useState } from "react";

import api from "../../../../shared/api/api";

export function useVerifyCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verifyCode(code, type) {
    setLoading(true);
    setError("");
    try {
      const res = await api.post(
        `/auth/verify-code?code=${encodeURIComponent(code)}&type=${encodeURIComponent(type)}`,
      );
      setLoading(false);
      return res.data;
    } catch (e) {
      setError(e?.response?.data?.message || "Network error");
      setLoading(false);
      return null;
    }
  }

  return { verifyCode, loading, error };
}
