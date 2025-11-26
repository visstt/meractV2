import { useEffect, useState } from "react";

import api from "../../../../../shared/api/api";

export const useMusic = () => {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMusic = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/music/find-all");

      // Проверяем, что получили массив
      if (Array.isArray(response.data)) {
        setMusic(response.data);
      } else {
        setMusic([]);
        console.warn(
          "Expected array from /music/find-all, got:",
          response.data,
        );
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching music:", err);

      // Обработка различных типов ошибок
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError("You need to be logged in to view music.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view music.");
      } else if (err.response?.status === 404) {
        setError("Music not found.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to load music. Please try again.");
      }

      setMusic([]);
      setLoading(false);
    }
  };

  // Автоматически загружаем музыку при монтировании компонента
  useEffect(() => {
    fetchMusic();
  }, []);

  const refetch = () => {
    fetchMusic();
  };

  const resetError = () => {
    setError(null);
  };

  return {
    music,
    loading,
    error,
    refetch,
    resetError,
  };
};
