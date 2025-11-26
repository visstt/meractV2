import { io } from "socket.io-client";

/**
 * WebSocket клиент для получения уведомлений о достижениях в реальном времени
 */
class AchievementSocket {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.currentUserId = null;
    this.currentStreamId = null;
  }

  /**
   * Подключиться к WebSocket серверу
   * @param {number} userId - ID текущего пользователя
   * @param {number} streamId - ID стрима (опционально, для зрителей)
   */
  connect(userId, streamId = null) {
    // Если уже подключены с теми же параметрами, не переподключаемся
    if (
      this.socket?.connected &&
      this.currentUserId === userId &&
      this.currentStreamId === streamId
    ) {
      console.log("Achievement socket already connected with same params");
      return;
    }

    // Если параметры изменились, переподключаемся
    if (
      this.socket?.connected &&
      (this.currentUserId !== userId || this.currentStreamId !== streamId)
    ) {
      console.log("Achievement socket params changed, reconnecting...");
      this.disconnect();
    }

    this.currentUserId = userId;
    this.currentStreamId = streamId;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    this.socket = io(`${socketUrl}/achievements`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Системные события
    this.socket.on("connect", () => {
      console.log("✅ Achievement socket connected");
      console.log("Listening for userId:", userId, "streamId:", streamId);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Achievement socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔴 Achievement socket connection error:", error);
    });

    // Подписываемся на персональные уведомления
    if (userId) {
      this.socket.on(`achievement:${userId}`, (data) => {
        console.log("🏆 Personal achievement received:", data);
        this.notifyListeners("personal", data);
      });
    }

    // Подписываемся на глобальные уведомления
    this.socket.on("achievement:global", (data) => {
      console.log("🌍 Global achievement received:", data);
      this.notifyListeners("global", data);
    });

    // Подписываемся на уведомления стрима (для зрителей)
    if (streamId) {
      this.socket.on(`achievement:stream:${streamId}`, (data) => {
        console.log("📺 Stream achievement received:", data);
        // Показываем как глобальное уведомление для зрителей
        this.notifyListeners("global", data);
      });
    }
  }

  /**
   * Отключиться от WebSocket сервера
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.currentUserId = null;
      this.currentStreamId = null;
      console.log("Achievement socket disconnected");
    }
  }

  /**
   * Добавить слушателя уведомлений
   * @param {string} type - Тип уведомлений ('personal' или 'global')
   * @param {Function} callback - Функция обратного вызова
   * @returns {Function} - Функция для отписки
   */
  addListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    // Возвращаем функцию для отписки
    return () => {
      this.removeListener(type, callback);
    };
  }

  /**
   * Удалить слушателя
   * @param {string} type - Тип уведомлений
   * @param {Function} callback - Функция обратного вызова
   */
  removeListener(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  /**
   * Уведомить всех слушателей о новом событии
   * @param {string} type - Тип события
   * @param {Object} data - Данные события
   */
  notifyListeners(type, data) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in achievement listener:", error);
        }
      });
    }
  }

  /**
   * Проверить статус подключения
   * @returns {boolean}
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Экспортируем синглтон
export const achievementSocket = new AchievementSocket();
