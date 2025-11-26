import { useState } from "react";

import api from "../../../../shared/api/api";

export const useUploadOutro = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const uploadOutro = async (outroFile) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append("outro", outroFile);

      const response = await api.post("/outro/upload-outro", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setUploading(false);

      return response.data;
    } catch (err) {
      console.error("Error uploading outro:", err);

      // Обработка различных типов ошибок
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Неверный формат файла. Пожалуйста, загрузите видео файл.");
      } else if (err.response?.status === 401) {
        setError("Вы должны быть авторизованы для загрузки outro.");
      } else if (err.response?.status === 403) {
        setError("У вас нет прав для загрузки outro.");
      } else if (err.response?.status === 413) {
        setError(
          "Файл слишком большой. Попробуйте загрузить файл меньшего размера.",
        );
      } else if (err.response?.status >= 500) {
        setError("Ошибка сервера. Попробуйте позже.");
      } else {
        setError("Не удалось загрузить outro. Попробуйте еще раз.");
      }

      setUploading(false);
      return null;
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    uploadOutro,
    uploading,
    error,
    success,
    resetState,
  };
};
