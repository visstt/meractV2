# 🏆 Система достижений

Полная реализация системы достижений с WebSocket уведомлениями в реальном времени.

## 📋 Установка

Установите необходимую зависимость:

```bash
yarn add socket.io-client
```

## 🚀 Использование

### 1. Базовое использование хука

```jsx
import { useAchievements } from "../shared/hooks/useAchievements";

function MyComponent() {
  const {
    achievements,
    userAchievements,
    isLoading,
    fetchAllAchievements,
    fetchUserAchievements,
  } = useAchievements();

  useEffect(() => {
    // Загружаем все достижения
    fetchAllAchievements();

    // Загружаем достижения пользователя
    fetchUserAchievements();
  }, []);

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Мои достижения ({userAchievements.length})</h2>
      {userAchievements.map((achievement) => (
        <div key={achievement.id}>{achievement.name}</div>
      ))}
    </div>
  );
}
```

### 2. Выдача достижения (только для админов)

```jsx
import { useAchievements } from "../shared/hooks/useAchievements";

function AdminPanel() {
  const { awardAchievement } = useAchievements();

  const handleAwardClick = async () => {
    try {
      await awardAchievement(userId, achievementId);
      alert("Достижение выдано!");
    } catch (error) {
      console.error("Ошибка при выдаче достижения:", error);
    }
  };

  return <button onClick={handleAwardClick}>Выдать достижение</button>;
}
```

### 3. Работа с WebSocket уведомлениями

WebSocket подключение и уведомления настраиваются автоматически через `AchievementNotificationContainer`, который уже добавлен в `App.jsx`.

Для ручного управления WebSocket:

```jsx
import { useAuthStore } from "../shared/stores/authStore";
import { achievementSocket } from "../shared/utils/achievementSocket";

function MyComponent() {
  const { user } = useAuthStore();

  useEffect(() => {
    // Подключиться к WebSocket
    achievementSocket.connect(user.id);

    // Добавить слушателя персональных уведомлений
    const unsubscribe = achievementSocket.addListener("personal", (data) => {
      console.log("Получено достижение:", data);
    });

    // Отписаться при размонтировании
    return () => {
      unsubscribe();
      achievementSocket.disconnect();
    };
  }, [user.id]);
}
```

## 📡 API Endpoints

### REST API

| Метод  | Endpoint                              | Описание                         | Доступ |
| ------ | ------------------------------------- | -------------------------------- | ------ |
| GET    | `/achievement/find-all`               | Получить все достижения          | Все    |
| GET    | `/achievement/user/:userId`           | Получить достижения пользователя | Все    |
| POST   | `/achievement/create-achievement`     | Создать достижение               | Админ  |
| POST   | `/achievement/award`                  | Выдать достижение                | Админ  |
| POST   | `/achievement/revoke`                 | Отозвать достижение              | Админ  |
| PUT    | `/achievement/update-achievement/:id` | Обновить достижение              | Админ  |
| DELETE | `/achievement/delete-achievement/:id` | Удалить достижение               | Админ  |

### WebSocket Events

**Подключение:** `http://localhost:3000/achievements`

**События для прослушивания:**

- `achievement:${userId}` - персональные уведомления
- `achievement:global` - глобальные уведомления

**Системные события:**

- `connect` - успешное подключение
- `disconnect` - отключение
- `connect_error` - ошибка подключения

## 🎨 Структура файлов

```
src/
├── shared/
│   ├── api/
│   │   └── achievementApi.js         # API методы для работы с достижениями
│   ├── hooks/
│   │   └── useAchievements.js        # Хук для управления достижениями
│   ├── stores/
│   │   └── achievementStore.js       # Zustand store для достижений
│   ├── ui/
│   │   ├── AchievementNotification/
│   │   │   ├── AchievementNotification.jsx
│   │   │   └── AchievementNotification.module.css
│   │   └── AchievementNotificationContainer/
│   │       └── AchievementNotificationContainer.jsx
│   └── utils/
│       └── achievementSocket.js      # WebSocket клиент
```

## 🔧 Конфигурация

Убедитесь, что в `.env` файле указан правильный URL API:

```env
VITE_API_URL=http://localhost:3000
```

## 📝 Примеры использования

### Проверка наличия достижения

```jsx
const { hasAchievement } = useAchievements();

if (hasAchievement(achievementId)) {
  console.log("У пользователя есть это достижение");
}
```

### Создание нового достижения

```jsx
const { createAchievement } = useAchievements();

const newAchievement = {
  name: "Первая победа",
  description: "Выиграйте свой первый матч",
  icon: "🏆",
  rarity: "common",
};

await createAchievement(newAchievement);
```

### Отзыв достижения

```jsx
const { revokeAchievement } = useAchievements();

await revokeAchievement(userId, achievementId);
```

## ⚡ Особенности

- ✅ Автоматическое переподключение WebSocket при разрыве соединения
- ✅ Красивые анимированные уведомления
- ✅ Поддержка персональных и глобальных уведомлений
- ✅ Автоматическое закрытие уведомлений через 5 секунд
- ✅ Управление состоянием через Zustand
- ✅ TypeScript-friendly API
- ✅ Обработка ошибок и логирование

## 🐛 Отладка

Для просмотра логов WebSocket откройте консоль браузера. Все события логируются:

```
✅ Achievement socket connected
🏆 Personal achievement received: {...}
🌍 Global achievement received: {...}
❌ Achievement socket disconnected: transport close
```
