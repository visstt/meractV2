import { useCallback, useEffect, useState } from "react";

import api from "../../../shared/api/api";

const useChat = (actId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Fetch messages
  const fetchMessages = useCallback(
    async (limit = 50, offset = 0) => {
      if (!actId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/chat/${actId}/messages`, {
          params: {
            limit,
            offset,
          },
        });

        setMessages(response.data);
      } catch (err) {
        console.error("Error fetching chat messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    },
    [actId],
  );

  // Send message
  const sendMessage = useCallback(
    async (message) => {
      if (!actId || !message?.trim()) return;

      try {
        setSending(true);
        setError(null);

        const response = await api.post(`/chat/${actId}/message`, {
          message: message.trim(),
        });

        // Add new message to the list
        setMessages((prevMessages) => [...prevMessages, response.data]);

        return response.data;
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
        throw err;
      } finally {
        setSending(false);
      }
    },
    [actId],
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

        // Prepend older messages
        setMessages((prevMessages) => [...response.data, ...prevMessages]);
      } catch (err) {
        console.error("Error loading more messages:", err);
        setError("Failed to load more messages");
      } finally {
        setLoading(false);
      }
    },
    [actId],
  );

  // Initial load
  useEffect(() => {
    if (actId) {
      fetchMessages();
    }
  }, [actId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    fetchMessages,
    loadMoreMessages,
    setMessages,
  };
};

export default useChat;
