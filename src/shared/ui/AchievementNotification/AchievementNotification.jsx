import { useCallback, useEffect, useState } from "react";

import styles from "./AchievementNotification.module.css";


export default function AchievementNotification({
  achievement,
  type = "personal",
  userName,
  onClose,
  duration = 5000,
}) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div
      className={`${styles.achievementNotification} ${isClosing ? styles.closing : ""}`}
    >
      <div className={styles.notificationHeader}>
        <div className={styles.notificationTitle}>
          🏆{" "}
          {type === "personal"
            ? "Achievement Unlocked!"
            : userName
              ? `Achievement Earned by ${userName}`
              : "Achievement Earned!"}
        </div>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>

      <div className={styles.notificationBody}>
        <div className={styles.achievementIcon}>{achievement.icon || "🎯"}</div>
        <div className={styles.notificationContent}>
          <div className={styles.achievementName}>
            {achievement.name || achievement.title || "Achievement"}
          </div>
          <div className={styles.achievementDescription}>
            {achievement.description ||
              (type === "personal"
                ? "Congratulations on unlocking this achievement!"
                : "A viewer has earned this achievement!")}
          </div>
          <span className={styles.notificationType}>
            {type === "personal" ? "Your Achievement" : "Viewer Achievement"}
          </span>
        </div>
      </div>
    </div>
  );
}
