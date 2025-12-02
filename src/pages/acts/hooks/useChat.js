import { useCallback, useEffect, useRef, useState } from "react";

import { io } from "socket.io-client";

import api from "../../../shared/api/api";

const useChat = (actId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef(null);

  // Подключение к WebSocket
  useEffect(() => {
    if (!actId) return;

    console.log(`🔌 Подключение к чату для акта ${actId}...`);

    // Создаем подключение к базовому URL с namespace /chat
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      path: "/socket.io",
      withCredentials: true, // ОБЯЗАТЕЛЬНО для отправки httpOnly cookies
      transports: ["websocket", "polling"],
    });

    // Подключаемся к namespace /chat
    const chatSocket = socket.of("/chat");

    socketRef.current = chatSocket;

    // Обработчики событий для chatSocket
    chatSocket.on("connect", () => {
      console.log("✅ Подключен к чату актов, socket.id:", chatSocket.id);
      setIsConnected(true);
      setError(null);

      // Подписываемся на комнату акта
      console.log(`📍 Подписка на комнату акта ${actId}...`);

      // ВАЖНО: Сервер подписывает пользователя при отправке sendMessage
      // Отправляем техническое сообщение с пробелом для активации подписки
      // Оно будет отфильтровано при отображении
      setTimeout(() => {
        console.log(
          "📡 Отправка технического сообщения для активации подписки...",
        );
        chatSocket.emit("sendMessage", {
          actId: parseInt(actId),
          content: " ", // Пробел - будет отфильтрован при отображении
        });
        console.log(
          "✅ Техническое сообщение отправлено (не будет показано пользователям)",
        );
      }, 100);
    });

    chatSocket.on("connect_error", (err) => {
      console.error("❌ Ошибка подключения к чату:", err.message);
      setError("Failed to connect to chat");
      setIsConnected(false);
    });

    chatSocket.on("disconnect", (reason) => {
      console.log("🔌 Отключен от чата, причина:", reason);
      setIsConnected(false);
    });

    // Получение нового сообщения
    chatSocket.on("newMessage", (message) => {
      console.log("📨 Новое сообщение получено через WebSocket:", message);

      // Игнорируем пустые сообщения (технические)
      const content = message.content || message.message || "";
      if (!content.trim()) {
        console.log("⚠️ Пропускаем пустое сообщение (техническое)");
        return;
      }

      setMessages((prevMessages) => {
        // Проверяем, не существует ли уже это сообщение (по id)
        const messageExists = prevMessages.some((msg) => msg.id === message.id);
        if (messageExists) {
          console.log("⚠️ Сообщение уже существует, пропускаем:", message.id);
          return prevMessages;
        }

        console.log(
          "Текущие сообщения:",
          prevMessages.length,
          "-> Добавляем:",
          message,
        );
        return [...prevMessages, message];
      });
    });

    // Добавим обработку всех событий для отладки
    chatSocket.onAny((eventName, ...args) => {
      console.log(`🔔 Socket event: ${eventName}`, args);
    });

    // Очистка при размонтировании
    return () => {
      console.log("🔌 Отключение от чата для акта", actId);
      chatSocket.disconnect();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [actId]);

  // Fetch initial messages (HTTP - для истории)
  const fetchMessages = useCallback(
    async (limit = 50, offset = 0) => {
      if (!actId) return;

      try {
        setLoading(true);
        setError(null);

        console.log(`📥 Загрузка начальных сообщений для акта ${actId}...`);
        const response = await api.get(`/chat/${actId}/messages`, {
          params: {
            limit,
            offset,
          },
        });

        // Фильтруем пустые сообщения (технические)
        const filteredMessages = response.data.filter((msg) => {
          const content = msg.content || msg.message || "";
          return content.trim() !== "";
        });

        console.log(
          `✅ Загружено ${filteredMessages.length} сообщений из истории (из ${response.data.length} всего)`,
        );
        setMessages(filteredMessages);
      } catch (err) {
        console.error("Error fetching chat messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    },
    [actId],
  );

  // Send message через WebSocket
  const sendMessage = useCallback(
    (message) => {
      if (!actId || !message?.trim()) {
        console.warn(
          "⚠️ Невозможно отправить сообщение: пустое сообщение или нет actId",
        );
        return;
      }

      if (!socketRef.current) {
        console.warn(
          "⚠️ Невозможно отправить сообщение: сокет не инициализирован",
        );
        return;
      }

      if (!isConnected) {
        console.warn("⚠️ Невозможно отправить сообщение: сокет не подключен");
        return;
      }

      try {
        setSending(true);
        setError(null);

        const payload = {
          actId: parseInt(actId),
          content: message.trim(),
        };

        console.log("📤 Отправка сообщения через WebSocket:", payload);

        // Отправляем через WebSocket
        socketRef.current.emit("sendMessage", payload);

        console.log("✅ Сообщение отправлено через WebSocket:", message);
        console.log("⏳ Ожидаем событие newMessage от сервера...");

        // Добавляем таймер для проверки - если через 2 секунды не пришло событие,
        // перезагружаем сообщения через HTTP
        setTimeout(() => {
          console.log("⏰ Прошло 2 секунды, проверяем получение сообщения...");
          // Можно перезагрузить сообщения если нужно
        }, 2000);
      } catch (err) {
        console.error("❌ Error sending message:", err);
        setError("Failed to send message");
      } finally {
        setSending(false);
      }
    },
    [actId, isConnected],
  );

  // Load more messages (for pagination)
  const loadMoreMessages = useCallback(
    async (offset) => {
      if (!actId) return;

      try {
        setLoading(true);

        const response = await api.get(`/chat/${actId}/messages`, {
          params: {
            limit: 50,
            offset,
          },
        });

        // Фильтруем пустые сообщения и добавляем старые сообщения
        const filteredMessages = response.data.filter((msg) => {
          const content = msg.content || msg.message || "";
          return content.trim() !== "";
        });

        setMessages((prevMessages) => [...filteredMessages, ...prevMessages]);
      } catch (err) {
        console.error("Error loading more messages:", err);
        setError("Failed to load more messages");
      } finally {
        setLoading(false);
      }
    },
    [actId],
  );

  // Initial load - загружаем только один раз при изменении actId
  useEffect(() => {
    if (actId) {
      console.log(`🔄 Загрузка истории сообщений для акта ${actId}`);
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actId]); // Только actId, не fetchMessages!

  // Fallback: Если WebSocket не работает, периодически обновляем через HTTP
  useEffect(() => {
    if (!actId || !isConnected) return;

    console.log(
      "🔄 Запуск периодической проверки новых сообщений (каждые 5 сек)",
    );

    const interval = setInterval(() => {
      // Получаем последний ID сообщения
      if (messages.length > 0) {
        const lastMessageId = messages[messages.length - 1].id;
        console.log(`🔍 Проверка новых сообщений после ID ${lastMessageId}...`);

        // Загружаем сообщения и проверяем, есть ли новые
        api
          .get(`/chat/${actId}/messages`, {
            params: { limit: 10, offset: 0 },
          })
          .then((response) => {
            const newMessages = response.data.filter((msg) => {
              const content = msg.content || msg.message || "";
              return (
                content.trim() !== "" && // Фильтруем пустые
                msg.id > lastMessageId &&
                !messages.some((m) => m.id === msg.id)
              );
            });

            if (newMessages.length > 0) {
              console.log(
                `✅ Найдено ${newMessages.length} новых сообщений через HTTP`,
              );
              setMessages((prev) => [...prev, ...newMessages]);
            }
          })
          .catch((err) => {
            console.error("Ошибка при проверке новых сообщений:", err);
          });
      }
    }, 5000); // Каждые 5 секунд

    return () => {
      console.log("⏹️ Остановка периодической проверки сообщений");
      clearInterval(interval);
    };
  }, [actId, isConnected, messages, setMessages]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    fetchMessages,
    loadMoreMessages,
    setMessages,
    isConnected, // Добавляем статус подключения
  };
};

export default useChat;
