import { useEffect, useState } from "react";

import api from "../../../../shared/api/api";

export const useEffects = () => {
  const [effects, setEffects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEffects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/effect/find-all");

      if (Array.isArray(response.data)) {
        setEffects(response.data);
      } else {
        setEffects([]);
        console.warn(
          "Expected array from /effect/find-all, got:",
          response.data,
        );
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching effects:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError("You need to be logged in to view effects.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view effects.");
      } else if (err.response?.status === 404) {
        setError("Effects not found.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to load effects. Please try again.");
      }

      setEffects([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEffects();
  }, []);

  const refetch = () => {
    fetchEffects();
  };

  const resetError = () => {
    setError(null);
  };

  return {
    effects,
    loading,
    error,
    refetch,
    resetError,
  };
};
