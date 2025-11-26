import { useEffect, useState } from "react";

import api from "../../../../shared/api/api";

export const useOutros = () => {
  const [outros, setOutros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOutros = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/outro/find-all");

      // Проверяем, что получили массив
      if (Array.isArray(response.data)) {
        setOutros(response.data);
      } else {
        setOutros([]);
        console.warn(
          "Expected array from /outro/find-all, got:",
          response.data,
        );
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching outros:", err);

      // Обработка различных типов ошибок
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError("You need to be logged in to view outros.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view outros.");
      } else if (err.response?.status === 404) {
        setError("Outros not found.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to load outros. Please try again.");
      }

      setOutros([]);
      setLoading(false);
    }
  };

  // Автоматически загружаем outro при монтировании компонента
  useEffect(() => {
    fetchOutros();
  }, []);

  const refetch = () => {
    fetchOutros();
  };

  const resetError = () => {
    setError(null);
  };

  return {
    outros,
    loading,
    error,
    refetch,
    resetError,
  };
};
