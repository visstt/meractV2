import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../shared/api/api";
import { useAuthStore } from "../../shared/stores/authStore";
import NavBar from "../../shared/ui/NavBar/NavBar";
import styles from "./RankPage.module.css";

const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export default function RankPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("RankPage useEffect triggered");
    console.log("Current user:", user);
    console.log("Token:", token);

    const fetchUserRanks = async () => {
      let userId = user?.id;

      if (!userId && token) {
        console.log("Decoding token to get user ID");
        const decoded = decodeToken(token);
        console.log("Decoded token:", decoded);
        userId = decoded?.sub;
      }

      if (!userId) {
        console.warn("No user ID found, skipping fetch");
        setLoading(false);
        return;
      }

      console.log("Fetching ranks for user ID:", userId);

      try {
        setLoading(true);
        const response = await api.get(`/rank/user/${userId}`);
        console.log("API response received:", response);
        console.log("Raw ranks data:", response.data);

        const ranksData = response.data.map((item) => item.rank);
        console.log("Processed ranks:", ranksData);
        setRanks(ranksData);
      } catch (error) {
        console.error("Error fetching user ranks:", error);
        console.error("Error details:", error.response?.data || error.message);
      } finally {
        console.log("Fetch completed");
        setLoading(false);
      }
    };

    fetchUserRanks();
  }, [user?.id, token]);

  return (
    <div className={styles.container}>
      <div className="header">
        <div className="name">
          <img
            src="/icons/back_arrow.svg"
            alt="back_arrow"
            onClick={() => navigate(-1)}
            style={{ cursor: "pointer" }}
          />
          <h1>YOUR RANKS</h1>
        </div>
      </div>
      <div className="stripe"></div>

      <div className={styles.content}>
        {loading ? (
          <p className={styles.message}>Loading...</p>
        ) : ranks.length === 0 ? (
          <p className={styles.message}>You don't have any ranks yet</p>
        ) : (
          <div className={styles.ranksList}>
            {ranks.map((rank, index) => (
              <div key={rank.id || index} className={styles.rankCard}>
                <div className={styles.rankHeader}>
                  <h3 className={styles.rankName}>{rank.name}</h3>
                </div>
                {rank.description && (
                  <p className={styles.rankDescription}>{rank.description}</p>
                )}
                <div className={styles.rankFooter}>
                  <span className={styles.rankDate}>
                    Obtained: {new Date(rank.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NavBar />
    </div>
  );
}
