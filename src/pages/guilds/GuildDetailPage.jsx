import { useEffect, useRef, useState } from "react";

import { IoSend } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

import api from "../../shared/api/api";
import { useAuthStore } from "../../shared/stores/authStore";
import NavBar from "../../shared/ui/NavBar/NavBar";
import styles from "./GuildDetailPage.module.css";

export default function GuildDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [guild, setGuild] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchGuildDetails = async () => {
      try {
        const response = await api.get(`/guild/${id}`);
        setGuild(response.data);

        // Проверяем, является ли пользователь членом гильдии
        const userIsMember =
          response.data.members?.some(
            (member) => member.id === user?.id || member.userId === user?.id,
          ) || response.data.ownerId === user?.id;
        setIsMember(userIsMember);

        console.log("🔍 Membership check:", {
          userId: user?.id,
          members: response.data.members,
          ownerId: response.data.ownerId,
          isMember: userIsMember,
        });

        if (!userIsMember) {
          console.warn("⚠️ User is not a member of this guild");
        }
      } catch (error) {
        console.error("Error fetching guild details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuildDetails();
  }, [id, user?.id]);

  // WebSocket подключение
  useEffect(() => {
    if (!id) {
      console.error("❌ No guild id");
      return;
    }

    if (!isMember) {
      console.warn(
        "⚠️ Skipping socket connection - user is not a member of this guild",
      );
      return;
    }

    console.log(
      "🔌 Creating socket connection to:",
      `${import.meta.env.VITE_API_URL}/guild-chat`,
    );

    // Создаем подключение к сокету с поддержкой httpOnly cookies
    const socket = io(`${import.meta.env.VITE_API_URL}/guild-chat`, {
      withCredentials: true, // Важно: отправляет httpOnly cookies с бэкенда
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // Успешное подключение
    socket.on("connect", () => {
      console.log("✅ Connected to guild chat:", socket.id);
      // Присоединяемся к чату гильдии после подключения
      socket.emit("joinGuild", { guildId: parseInt(id) });
      console.log("📨 Joining guild:", parseInt(id));
    });

    // Ошибка подключения
    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      console.error("Error details:", error.message, error.data);
    });

    // Отключение
    socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected:", reason);
      if (reason === "io server disconnect") {
        console.error(
          "⚠️ Server forcefully disconnected the socket. Possible reasons:",
        );
        console.error("- User not authenticated");
        console.error("- User not a member of this guild");
        console.error("- Invalid token");
      }
    });

    // Подтверждение присоединения
    socket.on("joinedGuild", ({ guildId }) => {
      console.log("✅ Successfully joined guild:", guildId);
    });

    // Получаем историю сообщений
    socket.on("guildChatHistory", ({ messages }) => {
      console.log("📜 Chat history:", messages);
      setMessages(
        messages.map((msg) => ({
          id: msg.id,
          text: msg.message,
          userId: msg.userId,
          username: msg.user?.login || msg.user?.email || "Unknown",
          timestamp: new Date(msg.createdAt),
        })),
      );
    });

    // Получаем новые сообщения
    socket.on("newGuildMessage", (message) => {
      console.log("💬 New message:", message);
      setMessages((prev) => [
        ...prev,
        {
          id: message.id,
          text: message.message,
          userId: message.userId,
          username: message.user?.login || message.user?.email || "Unknown",
          timestamp: new Date(message.createdAt),
        },
      ]);
    });

    // Удаление сообщений
    socket.on("guildMessageDeleted", ({ messageId }) => {
      console.log("🗑️ Message deleted:", messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    // Ошибка отправки сообщения
    socket.on("messageError", ({ message }) => {
      console.error("❌ Error sending message:", message);
    });

    // Ошибка удаления
    socket.on("deleteError", ({ message }) => {
      console.error("❌ Error deleting message:", message);
    });

    // Обработка общих ошибок
    socket.on("error", ({ message }) => {
      console.error("❌ Guild chat error:", message);
    });

    // Очистка при размонтировании
    return () => {
      socket.emit("leaveGuild");
      socket.disconnect();
    };
  }, [id, isMember]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log("Attempting to send message:", {
      message: newMessage,
      socketExists: !!socketRef.current,
      socketConnected: socketRef.current?.connected,
      guildId: id,
    });

    if (newMessage.trim() && socketRef.current && socketRef.current.connected) {
      console.log("Emitting sendGuildMessage:", {
        guildId: parseInt(id),
        message: newMessage.trim(),
      });
      socketRef.current.emit("sendGuildMessage", {
        guildId: parseInt(id),
        message: newMessage.trim(),
      });
      setNewMessage("");
    } else {
      console.error("Cannot send message:", {
        hasMessage: !!newMessage.trim(),
        hasSocket: !!socketRef.current,
        isConnected: socketRef.current?.connected,
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!guild) {
    return <div className={styles.error}>Guild not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className="header">
        <div className="name">
          <img
            src="/icons/back_arrow.svg"
            alt="back_arrow"
            onClick={() => navigate("/guilds")}
            style={{ cursor: "pointer" }}
          />
          <h1>{guild.name}</h1>
        </div>
      </div>
      <div className="stripe"></div>

      <div className={styles.content}>
        <div
          className={styles.guildBanner}
          style={{
            backgroundImage: `url(${guild.logoFileName || "/images/guildCardBg.png"})`,
          }}
        >
          <div className={styles.bannerOverlay}>
            <h2>{guild.name}</h2>
            <p>{guild.description}</p>
          </div>
        </div>

        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <h3>Guild Chat</h3>
            <span>{guild.members?.length || 0} members</span>
          </div>

          <div className={styles.messagesContainer}>
            {!isMember ? (
              <div className={styles.emptyChat}>
                <p>⚠️ You are not a member of this guild</p>
                <p style={{ fontSize: "12px", marginTop: "10px" }}>
                  Join the guild to access the chat
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.emptyChat}>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={styles.message}>
                  <div className={styles.messageHeader}>
                    <span className={styles.username}>{message.username}</span>
                    <span className={styles.timestamp}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p>{message.text}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
            <div className={styles.chatInput}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  isMember ? "Type your message..." : "Join the guild to chat"
                }
                className={styles.messageInput}
                disabled={!isMember}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!isMember}
              >
                <IoSend size={20} style={{ color: "white" }} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <NavBar />
    </div>
  );
}
