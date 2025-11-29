import { useEffect, useState } from "react";

import api from "../../../shared/api/api";
import { useAuthStore } from "../../../shared/stores/authStore";

export const useUserGuild = () => {
  const [guild, setGuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchUserGuild = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/guild/${user.id}`);
        setGuild(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user guild:", err);
        setError(err.message || "Failed to fetch guild");
      } finally {
        setLoading(false);
      }
    };

    fetchUserGuild();
  }, [user?.id]);

  return { guild, loading, error };
};
