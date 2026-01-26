import api from "./api";

export const achievementApi = {
  getAllAchievements: async () => {
    const response = await api.get("/achievement/find-all");
    return response.data;
  },

  getUserAchievements: async (userId) => {
    const response = await api.get(`/achievement/user/${userId}`);
    return response.data;
  },

  createAchievement: async (achievementData) => {
    const response = await api.post(
      "/achievement/create-achievement",
      achievementData,
    );
    return response.data;
  },

  awardAchievement: async (awardData) => {
    const response = await api.post("/achievement/award", awardData);
    return response.data;
  },

  revokeAchievement: async (revokeData) => {
    const response = await api.post("/achievement/revoke", revokeData);
    return response.data;
  },

  updateAchievement: async (id, achievementData) => {
    const response = await api.put(
      `/achievement/update-achievement/${id}`,
      achievementData,
    );
    return response.data;
  },

  deleteAchievement: async (id) => {
    const response = await api.delete(`/achievement/delete-achievement/${id}`);
    return response.data;
  },
};
