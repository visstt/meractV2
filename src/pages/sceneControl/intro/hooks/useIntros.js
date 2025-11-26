import { useEffect, useState } from "react";

import api from "../../../../shared/api/api";

export const useIntros = () => {
  const [intros, setIntros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIntros = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/intro/find-all");

      // Проверяем, что получили массив
      if (Array.isArray(response.data)) {
        setIntros(response.data);
      } else {
        setIntros([]);
        console.warn(
          "Expected array from /intro/find-all, got:",
          response.data,
        );
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching intros:", err);

      // Обработка различных типов ошибок
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError("You need to be logged in to view intros.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view intros.");
      } else if (err.response?.status === 404) {
        setError("Intros not found.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to load intros. Please try again.");
      }

      setIntros([]);
      setLoading(false);
    }
  };

  // Автоматически загружаем интро при монтировании компонента
  useEffect(() => {
    fetchIntros();
  }, []);

  const refetch = () => {
    fetchIntros();
  };

  const resetError = () => {
    setError(null);
  };

  return {
    intros,
    loading,
    error,
    refetch,
    resetError,
  };
};
