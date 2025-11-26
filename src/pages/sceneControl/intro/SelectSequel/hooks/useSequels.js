import { useEffect, useState } from "react";

import api from "../../../../../shared/api/api";

export default function useSequels() {
  const [sequels, setSequels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSequels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/sequel/my-sequels");
      setSequels(response.data);

      console.log("Sequels fetched successfully:", response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch sequels";
      console.error("Error fetching sequels:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSequels();
  }, []);

  const refetchSequels = () => {
    fetchSequels();
  };

  return {
    sequels,
    loading,
    error,
    refetchSequels,
  };
}
