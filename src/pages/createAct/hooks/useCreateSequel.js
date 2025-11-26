import { useState } from "react";

import api from "../../../shared/api/api";

export const useCreateSequel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createSequel = async (sequelData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Создаем FormData для отправки файла
      const formData = new FormData();

      // Добавляем обязательные поля
      formData.append("title", sequelData.title);
      formData.append("episodes", sequelData.episodes);

      // Добавляем фото если есть
      if (sequelData.photo) {
        formData.append("photo", sequelData.photo);
      }

      const response = await api.post("/sequel/create-sequel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setLoading(false);

      return response.data;
    } catch (err) {
      console.error("Error creating sequel:", err);

      // Обработка различных типов ошибок
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Invalid data provided. Please check all fields.");
      } else if (err.response?.status === 401) {
        setError("You need to be logged in to create a sequel.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to create a sequel.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to create sequel. Please try again.");
      }

      setLoading(false);
      return null;
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    createSequel,
    loading,
    error,
    success,
    resetState,
  };
};
