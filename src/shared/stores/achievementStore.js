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
    console.log("🔔 achievementStore.addNotification called:", notification);

    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...notification,
    };

    set((state) => {
      console.log(
        "📊 Current notifications count:",
        state.notifications.length,
      );

      // Если это персональное уведомление, добавляем достижение в список пользователя
      if (notification.type === "personal" && notification.achievement) {
        const achievementExists = state.userAchievements.some(
          (a) => a.id === notification.achievement.id,
        );

        if (!achievementExists) {
          console.log("➕ Adding personal achievement to user achievements");
          return {
            notifications: [...state.notifications, newNotification],
            userAchievements: [
              ...state.userAchievements,
              notification.achievement,
            ],
          };
        } else {
          console.log("⚠️ Achievement already exists in user achievements");
        }
      }

      console.log("➕ Adding notification to list");
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

  // Проверка, есть ли у пользователя конкретное достижение
  hasAchievement: (achievementId) => {
    const state = get();
    return state.userAchievements.some((a) => a.id === achievementId);
  },
}));
