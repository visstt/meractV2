import { useState } from "react";

import { achievementApi } from "../api/achievementApi";
import { useAchievementStore } from "../stores/achievementStore";
import { useAuthStore } from "../stores/authStore";

/**
 * Хук для работы с достижениями
 */
export function useAchievements() {
  const { user } = useAuthStore();
  const {
    achievements,
    userAchievements,
    isLoading,
    error,
    setAchievements,
    setUserAchievements,
    setLoading,
    setError,
    hasAchievement,
  } = useAchievementStore();

  const [isFetching, setIsFetching] = useState(false);

  /**
   * Загрузить все достижения
   */
  const fetchAllAchievements = async () => {
    setIsFetching(true);
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.getAllAchievements();
      setAchievements(data);
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch achievements";
      setError(errorMessage);
      console.error("Error fetching achievements:", err);
      return null;
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  /**
   * Загрузить достижения текущего пользователя
   */
  const fetchUserAchievements = async (userId = user?.id) => {
    if (!userId) {
      console.warn("No user ID provided for fetching achievements");
      return null;
    }

    setIsFetching(true);
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.getUserAchievements(userId);
      setUserAchievements(data);
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch user achievements";
      setError(errorMessage);
      console.error("Error fetching user achievements:", err);
      return null;
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  /**
   * Создать новое достижение (только для админов)
   */
  const createAchievement = async (achievementData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.createAchievement(achievementData);
      // Обновляем список всех достижений
      await fetchAllAchievements();
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create achievement";
      setError(errorMessage);
      console.error("Error creating achievement:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Выдать достижение пользователю (только для админов)
   */
  const awardAchievement = async (userId, achievementId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.awardAchievement({
        userId,
        achievementId,
      });
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to award achievement";
      setError(errorMessage);
      console.error("Error awarding achievement:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Отозвать достижение у пользователя (только для админов)
   */
  const revokeAchievement = async (userId, achievementId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.revokeAchievement({
        userId,
        achievementId,
      });
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to revoke achievement";
      setError(errorMessage);
      console.error("Error revoking achievement:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обновить достижение (только для админов)
   */
  const updateAchievement = async (id, achievementData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.updateAchievement(id, achievementData);
      // Обновляем список всех достижений
      await fetchAllAchievements();
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update achievement";
      setError(errorMessage);
      console.error("Error updating achievement:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Удалить достижение (только для админов)
   */
  const deleteAchievement = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.deleteAchievement(id);
      // Обновляем список всех достижений
      await fetchAllAchievements();
      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete achievement";
      setError(errorMessage);
      console.error("Error deleting achievement:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Данные
    achievements,
    userAchievements,
    isLoading: isLoading || isFetching,
    error,

    // Методы
    fetchAllAchievements,
    fetchUserAchievements,
    createAchievement,
    awardAchievement,
    revokeAchievement,
    updateAchievement,
    deleteAchievement,
    hasAchievement,
  };
}
