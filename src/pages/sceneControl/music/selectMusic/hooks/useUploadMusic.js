import { useState } from "react";

import api from "../../../../../shared/api/api";

export const useUploadMusic = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const uploadMusicFile = async (musicFile) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("music", musicFile);

      const response = await api.post("/music/upload-music", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setUploading(false);

      console.log("Music uploaded successfully:", response.data.music);

      return response.data;
    } catch (err) {
      console.error("Error uploading music:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Неверный формат файла. Пожалуйста, загрузите аудио файл.");
      } else if (err.response?.status === 401) {
        setError("Вы должны быть авторизованы для загрузки музыки.");
      } else if (err.response?.status === 403) {
        setError("У вас нет прав для загрузки музыки.");
      } else if (err.response?.status === 413) {
        setError(
          "Файл слишком большой. Попробуйте загрузить файл меньшего размера.",
        );
      } else if (err.response?.status >= 500) {
        setError("Ошибка сервера. Попробуйте позже.");
      } else {
        setError("Не удалось загрузить музыку. Попробуйте еще раз.");
      }

      setUploading(false);
      return null;
    }
  };

  const uploadMusicFromUrl = async (url) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!url || !url.trim()) {
        throw new Error("Пожалуйста, введите ссылку на файл");
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Не удалось скачать файл по ссылке");
      }

      const blob = await response.blob();

      if (!blob.type.startsWith("audio/")) {
        throw new Error("Файл по ссылке не является аудио файлом");
      }

      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split("/").pop() || "downloaded-music.mp3";

      const file = new File([blob], fileName, { type: blob.type });

      const result = await uploadMusicFile(file);
      return result;
    } catch (err) {
      console.error("Error uploading music from URL:", err);
      setError(err.message || "Не удалось загрузить музыку по ссылке");
      setUploading(false);
      return null;
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    uploadMusicFile,
    uploadMusicFromUrl,
    uploading,
    error,
    success,
    resetState,
  };
};
