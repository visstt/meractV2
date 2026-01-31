import React from "react";

import styles from "./SpotAgentAssigned.module.css";

export default function SpotAgentAssigned({
  assignedAgents,
  spotAgentCount,
  isInitiator,
  onRemove,
  loading,
}) {
  if (assignedAgents.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>✅ Assigned Spot Agents</h3>
        <span className={styles.count}>
          {assignedAgents.length}/{spotAgentCount}
        </span>
      </div>

      <div className={styles.agentsList}>
        {assignedAgents.map((agent) => (
          <div key={agent.id} className={styles.agentCard}>
            <div className={styles.agentHeader}>
              <span className={styles.username}>
                {agent.user?.login || "Unknown"}
              </span>
              <span
                className={`${styles.status} ${
                  agent.status === "active" ? styles.active : styles.completed
                }`}
              >
                {agent.status}
              </span>
            </div>

            {agent.task && (
              <div className={styles.task}>
                <span className={styles.taskLabel}>Task:</span>
                <span className={styles.taskText}>{agent.task}</span>
              </div>
            )}

            <div className={styles.agentFooter}>
              <span className={styles.assignedAt}>
                Assigned: {new Date(agent.assignedAt).toLocaleDateString()}
              </span>

              {isInitiator && (
                <button
                  className={styles.removeButton}
                  onClick={() => onRemove(agent.id)}
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
