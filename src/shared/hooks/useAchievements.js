import { useState } from "react";

import { achievementApi } from "../api/achievementApi";
import { useAchievementStore } from "../stores/achievementStore";
import { useAuthStore } from "../stores/authStore";


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


  const createAchievement = async (achievementData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.createAchievement(achievementData);
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

  const updateAchievement = async (id, achievementData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.updateAchievement(id, achievementData);
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


  const deleteAchievement = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await achievementApi.deleteAchievement(id);
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
    achievements,
    userAchievements,
    isLoading: isLoading || isFetching,
    error,

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
