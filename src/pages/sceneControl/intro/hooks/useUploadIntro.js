import { useState } from "react";

import api from "../../../../shared/api/api";

export const useUploadIntro = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const uploadIntro = async (introFile) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("intro", introFile);

      const response = await api.post("/intro/upload-intro", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setUploading(false);

      return response.data;
    } catch (err) {
      console.error("Error uploading intro:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Неверный формат файла. Пожалуйста, загрузите видео файл.");
      } else if (err.response?.status === 401) {
        setError("Вы должны быть авторизованы для загрузки интро.");
      } else if (err.response?.status === 403) {
        setError("У вас нет прав для загрузки интро.");
      } else if (err.response?.status === 413) {
        setError(
          "Файл слишком большой. Попробуйте загрузить файл меньшего размера.",
        );
      } else if (err.response?.status >= 500) {
        setError("Ошибка сервера. Попробуйте позже.");
      } else {
        setError("Не удалось загрузить интро. Попробуйте еще раз.");
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
    uploadIntro,
    uploading,
    error,
    success,
    resetState,
  };
};
