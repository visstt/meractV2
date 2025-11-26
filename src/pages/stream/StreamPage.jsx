import React from "react";

import { useLocation, useParams } from "react-router-dom";

import StreamViewer from "../acts/components/StreamViewer";
import styles from "./StreamPage.module.css";

export default function StreamPage() {
  const { id } = useParams();
  const location = useLocation();
  const act = location.state?.act;

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

  return (
    <div className={styles.streamPage}>
      <div className={styles.streamHeader}>
        <h1>{act.title || act.name}</h1>
        <p>Стример: {act.navigator || act.user}</p>
        <p>Статус: {act.status || "ONLINE"}</p>
      </div>

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
  );
}
