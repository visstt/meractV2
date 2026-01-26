import { create } from "zustand";


export const useAchievementStore = create((set, get) => ({
  achievements: [],
  userAchievements: [],
  notifications: [],
  isLoading: false,
  error: null,

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

  addNotification: (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...notification,
    };

    set((state) => {
      if (notification.type === "personal" && notification.achievement) {
        const achievementExists = state.userAchievements.some(
          (a) => a.id === notification.achievement.id,
        );

        if (!achievementExists) {
          return {
            notifications: [...state.notifications, newNotification],
            userAchievements: [
              ...state.userAchievements,
              notification.achievement,
            ],
          };
        }
      }
      return {
        notifications: [...state.notifications, newNotification],
      };
    });

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

  hasAchievement: (achievementId) => {
    const state = get();
    return state.userAchievements.some((a) => a.id === achievementId);
  },
}));
