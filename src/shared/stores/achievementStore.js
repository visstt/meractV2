import { create } from "zustand";

/**
 * Store для управления достижениями
 */
export const useAchievementStore = create((set, get) => ({
  // Состояние
  achievements: [], // Все достижения
  userAchievements: [], // Достижения текущего пользователя
  notifications: [], // Уведомления о новых достижениях
  isLoading: false,
  error: null,

  // Действия
  setAchievements: (achievements) => {
    set({ achievements });
  },

  setUserAchievements: (userAchievements) => {
    set({ userAchievements });
  },

  addUserAchievement: (achievement) => {
    set((state) => ({
      userAchievements: [...state.userAchievements, achievement],
    }));
  },

  removeUserAchievement: (achievementId) => {
    set((state) => ({
      userAchievements: state.userAchievements.filter(
        (a) => a.id !== achievementId,
      ),
    }));
  },

  // Управление уведомлениями
  addNotification: (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    return newNotification.id;
  },

  removeNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  // Проверка, есть ли у пользователя конкретное достижение
  hasAchievement: (achievementId) => {
    const state = get();
    return state.userAchievements.some((a) => a.id === achievementId);
  },
}));
