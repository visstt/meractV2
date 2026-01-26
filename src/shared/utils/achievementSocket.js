import { io } from "socket.io-client";


class AchievementSocket {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.currentUserId = null;
    this.currentStreamId = null;
  }


  connect(userId, streamId = null) {
    if (
      this.socket?.connected &&
      this.currentUserId === userId &&
      this.currentStreamId === streamId
    ) {
      console.log("Achievement socket already connected with same params");
      return;
    }

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

    this.socket.on("connect", () => {
      console.log("Achievement socket connected");
      console.log("Listening for userId:", userId, "streamId:", streamId);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Achievement socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Achievement socket connection error:", error);
    });

    this.socket.onAny((eventName, ...args) => {
      console.log("Socket event received:", eventName, args);
    });

    if (userId) {
      const personalChannel = `achievement:${userId}`;
      console.log("Subscribing to personal channel:", personalChannel);
      this.socket.on(personalChannel, (data) => {
        console.log("Personal achievement received:", data);
        this.notifyListeners("personal", data);
      });
    }

    console.log("Subscribing to global channel: achievement:global");
    this.socket.on("achievement:global", (data) => {
      console.log("Global achievement received:", data);
      this.notifyListeners("global", data);
    });

    if (streamId) {
      const streamChannel = `achievement:stream:${streamId}`;
      console.log("Subscribing to stream channel:", streamChannel);

      this.socket.on(streamChannel, (data) => {
        console.log("Stream achievement received:", {
          data,
          currentUserId: userId,
          dataUserId: data.userId,
          dataUserIdFromUser: data.user?.id,
        });

        if (data.userId === userId || data.user?.id === userId) {
          console.log("This achievement is for current user");
          this.notifyListeners("personal", data);
        } else {
          console.log("This achievement is for another user");
          this.notifyListeners("global", data);
        }
      });
    }
  }

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


  addListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    return () => {
      this.removeListener(type, callback);
    };
  }


  removeListener(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

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


  isConnected() {
    return this.socket?.connected || false;
  }
}

export const achievementSocket = new AchievementSocket();
