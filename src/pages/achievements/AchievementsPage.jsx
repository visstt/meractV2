import { useEffect, useState } from "react";

import { useAchievements } from "../../shared/hooks/useAchievements";
import { useAuthStore } from "../../shared/stores/authStore";
import styles from "./AchievementsPage.module.css";

/**
 * Страница для просмотра и управления достижениями
 */
export default function AchievementsPage() {
  const { user } = useAuthStore();
  const {
    achievements,
    userAchievements,
    isLoading,
    error,
    fetchAllAchievements,
    fetchUserAchievements,
    hasAchievement,
  } = useAchievements();

  const [selectedTab, setSelectedTab] = useState("all"); // 'all' или 'my'

  useEffect(() => {
    // Загружаем все достижения при монтировании
    fetchAllAchievements();

    // Загружаем достижения пользователя
    if (user?.id) {
      fetchUserAchievements();
    }
  }, [user?.id, fetchAllAchievements, fetchUserAchievements]);

  const displayedAchievements =
    selectedTab === "all" ? achievements : userAchievements;

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏆 Достижения</h1>
        <div className={styles.stats}>
          <span>
            Получено: {userAchievements.length} / {achievements.length}
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${selectedTab === "all" ? styles.active : ""}`}
          onClick={() => setSelectedTab("all")}
        >
          Все достижения ({achievements.length})
        </button>
        <button
          className={`${styles.tab} ${selectedTab === "my" ? styles.active : ""}`}
          onClick={() => setSelectedTab("my")}
        >
          Мои достижения ({userAchievements.length})
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Загрузка достижений...</div>
      ) : (
        <div className={styles.achievementGrid}>
          {displayedAchievements.length === 0 ? (
            <div className={styles.empty}>
              {selectedTab === "all"
                ? "Нет доступных достижений"
                : "У вас пока нет достижений"}
            </div>
          ) : (
            displayedAchievements.map((achievement) => {
              const isUnlocked = hasAchievement(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`${styles.achievementCard} ${
                    isUnlocked ? styles.unlocked : styles.locked
                  }`}
                >
                  <div className={styles.achievementIcon}>
                    {isUnlocked ? achievement.icon || "🏆" : "🔒"}
                  </div>
                  <div className={styles.achievementContent}>
                    <h3 className={styles.achievementName}>
                      {achievement.name || achievement.title}
                    </h3>
                    <p className={styles.achievementDescription}>
                      {achievement.description}
                    </p>
                    {achievement.rarity && (
                      <span
                        className={`${styles.rarity} ${styles[achievement.rarity]}`}
                      >
                        {achievement.rarity}
                      </span>
                    )}
                  </div>
                  {isUnlocked && <div className={styles.unlockedBadge}>✓</div>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
