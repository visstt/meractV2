import React, { useCallback, useEffect, useState } from "react";

import { useLocation, useParams } from "react-router-dom";

import api from "../../shared/api/api";
import { useSpotAgent } from "../../shared/hooks/useSpotAgent";
import { useAuthStore } from "../../shared/stores/authStore";
import { SpotAgentSection } from "../../shared/ui/SpotAgent";
import StreamViewer from "../acts/components/StreamViewer";
import styles from "./StreamPage.module.css";

export default function StreamPage() {
  const { id } = useParams();
  const location = useLocation();
  const [act, setAct] = useState(location.state?.act || null);
  const [loading, setLoading] = useState(false);
  const [showSpotAgentPanel, setShowSpotAgentPanel] = useState(false);
  const { user } = useAuthStore();
  const {
    candidates,
    assignedAgents,
    loading: spotAgentLoading,
    error: spotAgentError,
    fetchCandidates,
    fetchAssigned,
    apply,
  } = useSpotAgent(id);

  // Check if user is the initiator (streamer)
  const isInitiator = user?.id === act?.userId || user?.sub === act?.userId;
  const currentUserId = user?.id || user?.sub;
  const hasApplied = candidates.some((c) => c.userId === currentUserId);
  const spotAgentCount = act?.spotAgentCount || 0;

  const fetchAct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`/act/${id}`);
      console.log("Fetched full act data:", response.data);
      setAct(response.data);
    } catch (err) {
      console.error("Error fetching act:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (
      !act ||
      typeof act.spotAgentCount === "undefined" ||
      typeof act.spotAgentMethods === "undefined"
    ) {
      console.log("Fetching act because data is missing");
      fetchAct();
    }
  }, [id, fetchAct]);

  // Fetch spot agent data when act is available
  useEffect(() => {
    if (act?.id && spotAgentCount > 0) {
      fetchCandidates();
      fetchAssigned();
    }
  }, [act?.id, spotAgentCount, fetchCandidates, fetchAssigned]);

  const handleApplyAsSpotAgent = async () => {
    try {
      await apply();
      alert("Заявка на участие как Spot Agent подана успешно!");
    } catch (err) {
      alert(err.message || "Не удалось подать заявку");
    }
  };

  if (!act && loading) {
    return (
      <div className={styles.streamPage}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!act) {
    return (
      <div className={styles.streamPage}>
        <div className={styles.error}>
          <h2>Стрим не найден</h2>
          <p>Не удалось загрузить информацию о стриме</p>
        </div>
      </div>
    );
  }

  console.log("StreamPage act data:", act);
  console.log("spotAgentCount:", act.spotAgentCount);
  console.log("spotAgentMethods:", act.spotAgentMethods);

  return (
    <div className={styles.streamPage}>
      <div className={styles.streamHeader}>
        <h1>{act.title || act.name}</h1>
        <p>Стример: {act.navigator || act.user}</p>
        <p>Статус: {act.status || "ONLINE"}</p>
      </div>

      <div className={styles.streamLayout}>
        <div className={styles.mainContent}>
          <div className={styles.streamContainer}>
            <StreamViewer
              channelName={id || act.id?.toString() || "default_channel"}
              streamData={act}
            />
          </div>

          <div className={styles.streamInfo}>
            <h3>Информация о стриме</h3>
            <p>Описание: {act.description || "Нет описания"}</p>
            <p>Длительность: {act.duration || "Неизвестно"}</p>
            <p>Зрители: {act.spectators || "Неизвестно"}</p>
          </div>
        </div>

        <div className={styles.sidebar}>
          <SpotAgentSection act={act} />
        </div>
      </div>

      {/* Floating Spot Agent Button for Viewers */}
      {!isInitiator && spotAgentCount > 0 && assignedAgents.length < spotAgentCount && (
        <div className={styles.floatingSpotAgentContainer}>
          {hasApplied ? (
            <div className={styles.appliedBadgeFloating}>
              ✓ Вы подали заявку на Spot Agent
            </div>
          ) : (
            <button
              className={styles.floatingSpotAgentButton}
              onClick={handleApplyAsSpotAgent}
              disabled={spotAgentLoading}
            >
              🙋 Стать Spot Agent
            </button>
          )}
          <div className={styles.spotAgentProgress}>
            Нужно: {spotAgentCount - assignedAgents.length} Spot Agent{spotAgentCount - assignedAgents.length > 1 ? "s" : ""}
          </div>
        </div>
      )}

      {spotAgentError && (
        <div className={styles.spotAgentError}>
          {spotAgentError}
        </div>
      )}
    </div>
  );
}
