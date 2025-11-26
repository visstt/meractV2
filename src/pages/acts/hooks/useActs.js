import { useEffect, useState } from "react";

import api from "../../../shared/api/api";

export function useActs() {
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActs = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching acts...");
      const response = await api.get("/act/get-acts");

      console.log("Acts fetched:", response.data);
      setActs(response.data || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch acts";
      console.error("Error fetching acts:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const stopAct = async (actId) => {
    try {
      console.log("Stopping act:", actId);
      const response = await api.post(`/act/stop-act?id=${actId}`);

      console.log("Act stopped:", response.data);

      // Обновляем список актов
      await fetchActs();

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to stop act";
      console.error("Error stopping act:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getActById = (id) => {
    return acts.find((act) => act.id === id);
  };

  const getActiveActs = () => {
    return acts.filter((act) => act.status === "ONLINE");
  };

  const getActsByCategory = (categoryId) => {
    return acts.filter((act) => act.categoryId === categoryId);
  };

  useEffect(() => {
    fetchActs();
  }, []);

  return {
    acts,
    loading,
    error,
    fetchActs,
    stopAct,
    getActById,
    getActiveActs,
    getActsByCategory,
  };
}
