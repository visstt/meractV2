import api from "./api";

/**
 * API для работы с достижениями
 */
export const achievementApi = {
  /**
   * Получить все достижения
   */
  getAllAchievements: async () => {
    const response = await api.get("/achievement/find-all");
    return response.data;
  },

  /**
   * Получить достижения конкретного пользователя
   * @param {number} userId - ID пользователя
   */
  getUserAchievements: async (userId) => {
    const response = await api.get(`/achievement/user/${userId}`);
    return response.data;
  },

  /**
   * Создать новое достижение (только для админов)
   * @param {Object} achievementData - Данные достижения
   */
  createAchievement: async (achievementData) => {
    const response = await api.post(
      "/achievement/create-achievement",
      achievementData,
    );
    return response.data;
  },

  /**
   * Выдать достижение пользователю (только для админов)
   * @param {Object} awardData - { userId, achievementId }
   */
  awardAchievement: async (awardData) => {
    const response = await api.post("/achievement/award", awardData);
    return response.data;
  },

  /**
   * Отозвать достижение у пользователя (только для админов)
   * @param {Object} revokeData - { userId, achievementId }
   */
  revokeAchievement: async (revokeData) => {
    const response = await api.post("/achievement/revoke", revokeData);
    return response.data;
  },

  /**
   * Обновить достижение (только для админов)
   * @param {number} id - ID достижения
   * @param {Object} achievementData - Обновленные данные
   */
  updateAchievement: async (id, achievementData) => {
    const response = await api.put(
      `/achievement/update-achievement/${id}`,
      achievementData,
    );
    return response.data;
  },

  /**
   * Удалить достижение (только для админов)
   * @param {number} id - ID достижения
   */
  deleteAchievement: async (id) => {
    const response = await api.delete(`/achievement/delete-achievement/${id}`);
    return response.data;
  },
};
