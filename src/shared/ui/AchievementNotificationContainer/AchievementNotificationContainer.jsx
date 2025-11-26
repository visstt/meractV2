import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import { useAchievementStore } from "../../stores/achievementStore";
import { useAuthStore } from "../../stores/authStore";
import { achievementSocket } from "../../utils/achievementSocket";

/**
 * Контейнер для отображения всех уведомлений о достижениях
 * Автоматически подключается к WebSocket и управляет уведомлениями
 */
export default function AchievementNotificationContainer() {
  console.log("🎬 AchievementNotificationContainer mounted");

  const { user, isAuthenticated } = useAuthStore();
  const { notifications, addNotification, removeNotification } =
    useAchievementStore();
  const [currentStreamId, setCurrentStreamId] = useState(null);

  console.log("👤 User state:", { user, isAuthenticated, userId: user?.id });

  // Определяем streamId если находимся на странице стрима
  useEffect(() => {
    console.log("🔄 StreamId effect running");

    const updateStreamId = () => {
      const pathMatch = window.location.pathname.match(
        /^\/stream(?:-host)?\/(\d+)$/,
      );
      const streamId = pathMatch ? pathMatch[1] : null;
      console.log("🎯 StreamId detection:", {
        path: window.location.pathname,
        match: pathMatch,
        streamId,
      });
      setCurrentStreamId(streamId);
    };

    // Проверяем при монтировании
    updateStreamId();

    // Слушаем изменения URL (для SPA навигации)
    const handleLocationChange = () => {
      updateStreamId();
    };

    window.addEventListener("popstate", handleLocationChange);

    // Для react-router также отслеживаем изменения через MutationObserver
    const observer = new MutationObserver(updateStreamId);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("🔄 Connection effect running:", {
      isAuthenticated,
      userId: user?.id,
      currentStreamId,
    });

    // Подключаемся к WebSocket только если пользователь авторизован
    if (isAuthenticated && user?.id) {
      console.log("✅ Conditions met, connecting to achievement socket:", {
        userId: user.id,
        streamId: currentStreamId,
        path: window.location.pathname,
      });

      achievementSocket.connect(user.id, currentStreamId);

      // Подписываемся на персональные уведомления
      const unsubscribePersonal = achievementSocket.addListener(
        "personal",
        (data) => {
          console.log("✅ Received personal achievement:", data);
          const achievement = data.achievement || data;
          const userName =
            data.userName || data.user?.login || data.user?.email;

          // Добавляем в store для сохранения в профиле
          addNotification({
            achievement,
            type: "personal",
            userName,
          });

          // Показываем toast уведомление
          toast.success(
            `🏆 Achievement Unlocked!\n${achievement.icon || "🎯"} ${achievement.name || "Achievement"}\n${achievement.description || "Congratulations!"}`,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            },
          );
        },
      );

      // Подписываемся на глобальные уведомления
      const unsubscribeGlobal = achievementSocket.addListener(
        "global",
        (data) => {
          console.log("✅ Received global achievement:", data);
          const achievement = data.achievement || data;
          const userName =
            data.userName || data.user?.login || data.user?.email;

          // Показываем toast уведомление
          toast.info(
            `${achievement.icon || "🎯"} ${userName || "Someone"} earned: ${achievement.name || "Achievement"}!`,
            {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            },
          );
        },
      );

      // Отписываемся при размонтировании или смене стрима
      return () => {
        unsubscribePersonal();
        unsubscribeGlobal();
        // Не отключаемся полностью при смене стрима, только переподключаемся
        if (!currentStreamId) {
          achievementSocket.disconnect();
        }
      };
    }
  }, [isAuthenticated, user?.id, currentStreamId, addNotification]);

  return null;
}
