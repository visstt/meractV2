import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

import { useAchievementStore } from "../../stores/achievementStore";
import { useAuthStore } from "../../stores/authStore";
import { achievementSocket } from "../../utils/achievementSocket";
import AchievementNotification from "../AchievementNotification/AchievementNotification";

/**
 * Контейнер для отображения всех уведомлений о достижениях
 * Автоматически подключается к WebSocket и управляет уведомлениями
 */
export default function AchievementNotificationContainer() {
  const { user, isAuthenticated } = useAuthStore();
  const { notifications, addNotification, removeNotification } =
    useAchievementStore();
  const location = useLocation();
  const [currentStreamId, setCurrentStreamId] = useState(null);

  // Определяем streamId если находимся на странице стрима
  useEffect(() => {
    const pathMatch = location.pathname.match(
      /^\/stream(?:-host)?\/(\d+)$/,
    );
    const streamId = pathMatch ? pathMatch[1] : null;
    setCurrentStreamId(streamId);
  }, [location.pathname]);

  useEffect(() => {
    // Подключаемся к WebSocket только если пользователь авторизован
    if (isAuthenticated && user?.id) {
      console.log("AchievementNotificationContainer connecting:", {
        userId: user.id,
        streamId: currentStreamId,
        path: location.pathname,
      });

      achievementSocket.connect(user.id, currentStreamId);

      // Подписываемся на персональные уведомления
      const unsubscribePersonal = achievementSocket.addListener(
        "personal",
        (data) => {
          console.log("Received personal achievement:", data);
          addNotification({
            achievement: data.achievement || data,
            type: "personal",
            userName: data.userName || data.user?.login || data.user?.email,
          });
        },
      );

      // Подписываемся на глобальные уведомления
      const unsubscribeGlobal = achievementSocket.addListener(
        "global",
        (data) => {
          console.log("Received global achievement:", data);
          addNotification({
            achievement: data.achievement || data,
            type: "global",
            userName: data.userName || data.user?.login || data.user?.email,
          });
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

  return (
    <div>
      {notifications.map((notification) => (
        <AchievementNotification
          key={notification.id}
          achievement={notification.achievement}
          type={notification.type}
          userName={notification.userName}
          onClose={() => removeNotification(notification.id)}
          duration={5000}
        />
      ))}
    </div>
  );
}
