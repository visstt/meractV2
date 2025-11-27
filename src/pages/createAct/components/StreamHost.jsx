import React, { useEffect, useRef, useState } from "react";

import AgoraRTC from "agora-rtc-sdk-ng";

import api from "../../../shared/api/api";
import { useAuthStore } from "../../../shared/stores/authStore";
import styles from "./StreamHost.module.css";

// Function to extract data from JWT token
const parseJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
};

const StreamHost = ({ actId, actTitle, onStopStream }) => {
  console.log("StreamHost received props:", {
    actId,
    actTitle,
    typeof: typeof actId,
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [actData, setActData] = useState(null);
  const [showIntro, setShowIntro] = useState(false);
  const [showOutro, setShowOutro] = useState(false);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const localVideoRef = useRef(null);
  const introVideoRef = useRef(null);
  const outroVideoRef = useRef(null);
  const musicAudioRef = useRef(null);
  const clientRef = useRef(null);
  const localTracksRef = useRef({});
  const isInitializingRef = useRef(false); // Flag to prevent multiple initialization
  const isStreamingStartedRef = useRef(false); // Flag to prevent multiple stream start

  // Get user from auth store
  const { user } = useAuthStore();

  // Extract user ID (use user.id first, then from token)
  let baseUserId;
  if (user?.id) {
    baseUserId = user.id;
  } else if (user?.token) {
    const tokenData = parseJWT(user.token);
    baseUserId = tokenData?.sub || tokenData?.id || 999999;
  } else {
    baseUserId = 999999; // Fixed fallback
  }

  // Create unique UID for streamer: использую комбинацию для уникальности
  // Формула: (actId * 1000000) + (baseUserId * 10) + role
  const userId = actId
    ? parseInt(actId) * 1000000 + baseUserId * 10 + 2
    : Math.floor(Date.now() / 1000) * 1000000 + baseUserId * 10 + 2;

  console.log(
    "StreamHost user data:",
    user,
    "baseUserId:",
    baseUserId,
    "userId:",
    userId,
    "actId:",
    actId,
  );

  // Яркий лог для проверки UID
  console.log(
    "%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "color: #FFD700; font-weight: bold; font-size: 14px;",
  );
  console.log(
    "%c🎥 STREAM HOST UID GENERATED",
    "color: #FFD700; font-weight: bold; font-size: 20px; background: #000; padding: 10px;",
  );
  console.log(
    "%cActID: %c" +
      actId +
      "%c | BaseUserID: %c" +
      baseUserId +
      "%c | Role: %c2 (PUBLISHER)",
    "color: #FFD700; font-weight: bold;",
    "color: #00FF00; font-weight: bold; font-size: 16px;",
    "color: #FFD700; font-weight: bold;",
    "color: #00FF00; font-weight: bold; font-size: 16px;",
    "color: #FFD700; font-weight: bold;",
    "color: #00FF00; font-weight: bold; font-size: 16px;",
  );
  console.log(
    "%c>>> FINAL UID: %c" + userId,
    "color: #FFD700; font-weight: bold; font-size: 16px;",
    "color: #FF00FF; font-weight: bold; font-size: 24px; text-shadow: 0 0 10px #FF00FF;",
  );
  console.log(
    "%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "color: #FFD700; font-weight: bold; font-size: 14px;",
  );

  // Сохраняем UID для проверки конфликтов (с меткой времени для отладки)
  window.__STREAM_UIDS__ = window.__STREAM_UIDS__ || {};
  const currentTime = Date.now();
  const uidKey = `${userId}_host`;

  // Проверяем реальные конфликты (UID используется другим активным соединением)
  // Конфликт только если UID уже существует И прошло больше 2 секунд (не React Strict Mode)
  const existingEntry = window.__STREAM_UIDS__[uidKey];
  const hasRealConflict = existingEntry && currentTime - existingEntry > 2000;

  if (hasRealConflict) {
    console.log(
      "%c╔═══════════════════════════════════════════════════════════════╗",
      "color: #FF0000; font-weight: bold; font-size: 16px;",
    );
    console.log(
      "%c║                    ⚠️  UID CONFLICT DETECTED! ⚠️                ║",
      "color: #FF0000; font-weight: bold; font-size: 20px; background: #000; padding: 10px;",
    );
    console.log(
      "%c║  This UID already exists: " +
        userId +
        "                              ║",
      "color: #FF0000; font-weight: bold; font-size: 18px;",
    );
    console.log(
      "%c║  Time since last use: " +
        (currentTime - existingEntry) +
        "ms                     ║",
      "color: #FF0000; font-weight: bold; font-size: 16px;",
    );
    console.log(
      "%c╚═══════════════════════════════════════════════════════════════╝",
      "color: #FF0000; font-weight: bold; font-size: 16px;",
    );
  } else {
    window.__STREAM_UIDS__[uidKey] = currentTime;
    console.log(
      "%c╔═══════════════════════════════════════════════════════════════╗",
      "color: #00FF00; font-weight: bold; font-size: 16px;",
    );
    console.log(
      "%c║                    ✅  UID IS UNIQUE! ✅                        ║",
      "color: #00FF00; font-weight: bold; font-size: 20px; background: #000; padding: 10px;",
    );
    console.log(
      "%c║  No conflicts found for UID: " +
        userId +
        "                          ║",
      "color: #00FF00; font-weight: bold; font-size: 18px;",
    );
    console.log(
      "%c╚═══════════════════════════════════════════════════════════════╝",
      "color: #00FF00; font-weight: bold; font-size: 16px;",
    );
  }

  // Generate channel ID based on actId
  const channelName = actId ? `act_${actId}` : `temp_${Date.now()}`;

  useEffect(() => {
    document.body.classList.add("no-overlay");
    return () => {
      document.body.classList.remove("no-overlay");

      // Clear UID when component unmounts
      const uidKey = `${userId}_host`;
      if (window.__STREAM_UIDS__ && window.__STREAM_UIDS__[uidKey]) {
        delete window.__STREAM_UIDS__[uidKey];
        console.log(
          "%c🗑️ UID cleared on unmount: " + userId,
          "color: #FFA500; font-weight: bold;",
        );
      }
    };
  }, [userId]);

  // Fetch act data to get intro/outro
  useEffect(() => {
    const fetchActData = async () => {
      if (!actId || actId === "undefined") return;

      try {
        console.log("Fetching act data for actId:", actId);
        const response = await api.get(`/act/find-by-id/${actId}`);
        setActData(response.data);
        console.log("Act data received:", response.data);
        console.log("Intro:", response.data?.intro);
        console.log("Outro:", response.data?.outro);
        console.log("Musics:", response.data?.musics);
      } catch (err) {
        console.error("Error fetching act data:", err);
      }
    };

    fetchActData();
  }, [actId]);

  useEffect(() => {
    // Get token for stream
    const getStreamToken = async () => {
      // Check if actId is valid
      if (!actId || actId === "undefined") {
        console.error("Cannot initialize stream: actId is invalid", actId);
        return;
      }

      // Prevent multiple initialization
      if (isInitializingRef.current) {
        console.log("Already initializing, skipping...");
        return;
      }

      // Check for UID conflict BEFORE starting stream
      if (hasRealConflict) {
        console.error("Cannot start stream: UID conflict detected!");
        setError(
          `UID conflict detected (${userId}). Please refresh the page and try again.`,
        );
        return;
      }

      isInitializingRef.current = true;

      try {
        console.log(
          "Getting stream token for channel:",
          channelName,
          "userId:",
          userId,
        );

        // Get token from your backend for publisher (streamer)
        const response = await api.get(
          `/act/token/${channelName}/PUBLISHER/uid?uid=${userId}&expiry=3600`,
        );
        setToken(response.data.token);

        console.log("Token received:", response.data.token);

        // Automatically start stream only once
        if (!isStreamingStartedRef.current) {
          isStreamingStartedRef.current = true;
          console.log("Starting stream automatically...");
          await startStreaming();
        }
      } catch (err) {
        console.error("Error getting stream token:", err);
        setError("Failed to get stream token");
      } finally {
        isInitializingRef.current = false;
      }
    };

    getStreamToken();

    // Cleanup on unmount
    return () => {
      isInitializingRef.current = false;
      isStreamingStartedRef.current = false;
      if (isStreaming) {
        stopStreaming();
      }
      stopCameraPreview();
      stopBackgroundMusic();
    };
  }, [actId, channelName, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to start camera preview
  const startCameraPreview = async () => {
    try {
      console.log("Starting camera preview...");

      // Check permissions and create preview
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log("Camera preview started successfully");
      }

      // Save stream for later stopping
      localTracksRef.current.previewStream = stream;
    } catch (err) {
      console.error("Error starting camera preview:", err);
      setError("Failed to access camera: " + err.message);
    }
  };

  // Function to stop camera preview
  const stopCameraPreview = () => {
    try {
      if (localTracksRef.current.previewStream) {
        localTracksRef.current.previewStream.getTracks().forEach((track) => {
          track.stop();
        });
        localTracksRef.current.previewStream = null;
        console.log("Camera preview stopped");
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    } catch (err) {
      console.error("Error stopping camera preview:", err);
    }
  };

  // Start background music
  const startBackgroundMusic = () => {
    if (!actData?.musics || actData.musics.length === 0) {
      console.log("No background music available");
      return;
    }

    const musicAudio = musicAudioRef.current;
    if (!musicAudio) {
      console.error("Music audio ref is not available");
      return;
    }

    // Sort music by order field if available
    const sortedMusic = [...actData.musics].sort((a, b) => {
      const orderA = a.order ?? a.ActMusic?.order ?? 0;
      const orderB = b.order ?? b.ActMusic?.order ?? 0;
      return orderA - orderB;
    });

    // Play first music track
    const firstMusic = sortedMusic[0];
    const musicUrl = firstMusic.fileName || firstMusic.music?.fileName;

    if (!musicUrl) {
      console.error("No music file URL found");
      return;
    }

    console.log("Starting background music:", musicUrl);

    musicAudio.src = musicUrl;
    musicAudio.volume = 0.25; // Set volume to 25% to not overpower voice
    musicAudio.loop = false; // We'll handle loop manually to cycle through tracks

    // When current track ends, play next one
    musicAudio.onended = () => {
      const nextIndex = (currentMusicIndex + 1) % sortedMusic.length;
      setCurrentMusicIndex(nextIndex);
      const nextMusic = sortedMusic[nextIndex];
      const nextMusicUrl = nextMusic.fileName || nextMusic.music?.fileName;

      console.log("Playing next music track:", nextMusicUrl);
      musicAudio.src = nextMusicUrl;
      musicAudio
        .play()
        .catch((err) => console.error("Error playing next music:", err));
    };

    // Добавляем обработчики событий для отладки
    musicAudio.onerror = (e) => {
      console.error("Music playback error:", e);
      console.error("Music source:", musicAudio.src);
    };

    musicAudio.onloadstart = () => {
      console.log("Music loading started:", musicAudio.src);
    };

    musicAudio.oncanplay = () => {
      console.log("Music can play:", musicAudio.src);
    };

    musicAudio
      .play()
      .then(() => {
        console.log("✅ Background music started successfully");
      })
      .catch((err) => {
        console.error("❌ Error playing background music:", err);
        console.error("Music data:", firstMusic);
        console.error("Music URL:", musicUrl);
      });
  };

  // Stop background music
  const stopBackgroundMusic = () => {
    const musicAudio = musicAudioRef.current;
    if (musicAudio) {
      musicAudio.pause();
      musicAudio.currentTime = 0;
      musicAudio.src = "";
      console.log("Background music stopped");
    }
  };

  // Play intro video and stream it via Agora
  const playIntroStream = async (client, audioTrack) => {
    return new Promise(async (resolve) => {
      const introUrl =
        actData?.intro?.fileName || actData?.intro?.intro?.fileName;

      if (!introUrl) {
        console.log("No intro video available, skipping...");
        resolve();
        return;
      }

      try {
        console.log("Playing intro video:", introUrl);
        setShowIntro(true);
        const introVideo = introVideoRef.current;

        if (!introVideo) {
          console.error("Intro video ref is not available");
          resolve();
          return;
        }

        introVideo.src = introUrl;
        introVideo.muted = false; // Включаем звук из видео

        // Ждем когда видео начнет воспроизводиться
        await introVideo.play();
        console.log("Intro video playing");

        // Теперь создаем stream из видео
        const stream = introVideo.captureStream();
        const videoTrack = stream.getVideoTracks()[0];
        const audioTracks = stream.getAudioTracks();

        if (!videoTrack) {
          console.error("Failed to capture video track from intro");
          setShowIntro(false);
          // Публикуем микрофон если intro не удался
          await client.publish([audioTrack]);
          resolve();
          return;
        }

        const agoraVideoTrack = AgoraRTC.createCustomVideoTrack({
          mediaStreamTrack: videoTrack,
        });

        // Если в intro есть аудио, используем его, иначе публикуем микрофон
        if (audioTracks.length > 0) {
          const agoraAudioTrack = AgoraRTC.createCustomAudioTrack({
            mediaStreamTrack: audioTracks[0],
          });
          await client.publish([agoraVideoTrack, agoraAudioTrack]);
          console.log("Intro video and audio tracks published");

          introVideo.onended = async () => {
            console.log("Intro ended, switching to camera and microphone");
            await client.unpublish([agoraVideoTrack, agoraAudioTrack]);
            agoraVideoTrack.stop();
            agoraVideoTrack.close();
            agoraAudioTrack.stop();
            agoraAudioTrack.close();
            // Публикуем микрофон после intro
            await client.publish([audioTrack]);
            setShowIntro(false);
            resolve();
          };
        } else {
          await client.publish([agoraVideoTrack, audioTrack]);
          console.log("Intro video track and microphone published");

          introVideo.onended = async () => {
            console.log("Intro ended, switching to camera");
            await client.unpublish([agoraVideoTrack]);
            agoraVideoTrack.stop();
            agoraVideoTrack.close();
            setShowIntro(false);
            resolve();
          };
        }

        // Отображаем локально
        if (localVideoRef.current) {
          agoraVideoTrack.play(localVideoRef.current);
        }
      } catch (err) {
        console.error("Error playing intro:", err);
        setShowIntro(false);
        resolve();
      }
    });
  };

  // Play outro video and stream it via Agora
  const playOutroStream = async (client) => {
    return new Promise(async (resolve) => {
      const outroUrl =
        actData?.outro?.fileName || actData?.outro?.outro?.fileName;

      if (!outroUrl) {
        console.log("No outro video available, skipping...");
        resolve();
        return;
      }

      try {
        console.log("Playing outro video:", outroUrl);

        // Останавливаем текущий video track камеры
        if (localTracksRef.current.videoTrack) {
          await client.unpublish([localTracksRef.current.videoTrack]);
          localTracksRef.current.videoTrack.stop();
          localTracksRef.current.videoTrack.close();
        }

        setShowOutro(true);
        const outroVideo = outroVideoRef.current;

        if (!outroVideo) {
          console.error("Outro video ref is not available");
          resolve();
          return;
        }

        outroVideo.src = outroUrl;
        outroVideo.muted = false;

        // Ждем когда видео начнет воспроизводиться
        await outroVideo.play();

        // Теперь создаем stream из видео
        const stream = outroVideo.captureStream();
        const videoTrack = stream.getVideoTracks()[0];

        if (!videoTrack) {
          console.error("Failed to capture video track from outro");
          setShowOutro(false);
          resolve();
          return;
        }

        const agoraVideoTrack = AgoraRTC.createCustomVideoTrack({
          mediaStreamTrack: videoTrack,
        });

        // Публикуем outro video track
        await client.publish([agoraVideoTrack]);
        console.log("Outro video track published");

        // Отображаем локально
        if (localVideoRef.current) {
          agoraVideoTrack.play(localVideoRef.current);
        }

        outroVideo.onended = async () => {
          console.log("Outro ended");
          await client.unpublish([agoraVideoTrack]);
          agoraVideoTrack.stop();
          agoraVideoTrack.close();
          setShowOutro(false);
          resolve();
        };
      } catch (err) {
        console.error("Error playing outro:", err);
        setShowOutro(false);
        resolve();
      }
    });
  };

  const startStreaming = async () => {
    if (!token) {
      setError("No token available");
      return;
    }

    try {
      setIsStreaming(true);
      setError(null);

      console.log("Starting stream for act:", actId, "channel:", channelName);
      console.log("Act data available:", actData);

      // Stop camera preview
      stopCameraPreview();

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      console.log("Agora client created, joining channel...");

      // Join channel
      await client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        channelName,
        token,
        userId,
      );

      console.log("Joined channel successfully");

      // Create audio track
      console.log("Creating microphone track...");
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localTracksRef.current = { audioTrack };

      // Play intro first if available
      const introUrl =
        actData?.intro?.fileName || actData?.intro?.intro?.fileName;
      if (introUrl) {
        console.log("Intro available, playing intro before camera...");
        await playIntroStream(client, audioTrack);
      } else {
        console.log("No intro available, publishing audio immediately");
        await client.publish([audioTrack]);
      }

      // Start background music after intro
      console.log("Starting background music...");
      startBackgroundMusic();

      // After intro, start camera stream
      console.log("Creating camera track...");
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      localTracksRef.current.videoTrack = videoTrack;

      // Play local video
      if (localVideoRef.current) {
        console.log("Playing local video...");
        videoTrack.play(localVideoRef.current);
      }

      // Publish camera track
      console.log("Publishing camera track...");
      await client.publish([videoTrack]);

      console.log("Stream started successfully");
    } catch (err) {
      console.error("Error starting stream:", err);
      setError("Failed to start stream: " + err.message);
      setIsStreaming(false);
    }
  };

  const stopStreaming = async () => {
    try {
      console.log("Stopping stream for act:", actId);

      // Stop background music before outro
      stopBackgroundMusic();

      // Play outro before stopping if available
      if (actData?.outro?.fileName && clientRef.current) {
        await playOutroStream(clientRef.current);
      }

      // Stop and close tracks
      if (localTracksRef.current.audioTrack) {
        localTracksRef.current.audioTrack.stop();
        localTracksRef.current.audioTrack.close();
      }
      if (localTracksRef.current.videoTrack) {
        localTracksRef.current.videoTrack.stop();
        localTracksRef.current.videoTrack.close();
      }

      // Leave channel
      if (clientRef.current) {
        await clientRef.current.leave();
      }

      // Clear UID from conflict detection
      const uidKey = `${userId}_host`;
      if (window.__STREAM_UIDS__ && window.__STREAM_UIDS__[uidKey]) {
        delete window.__STREAM_UIDS__[uidKey];
        console.log(
          "%c🗑️ UID cleared from conflict detection: " + userId,
          "color: #FFA500; font-weight: bold;",
        );
      }

      // Clear references
      localTracksRef.current = {};
      clientRef.current = null;

      // Send stop-act request to backend
      try {
        if (actId && actId !== "undefined") {
          await api.post(`/act/stop-act?id=${actId}`);
          console.log("Stop-act request sent successfully");
        } else {
          console.warn(
            "Skipping stop-act request: actId is undefined or invalid:",
            actId,
          );
        }
      } catch (apiError) {
        console.error("Error sending stop-act request:", apiError);
        // Don't block the UI flow if API fails
      }

      setIsStreaming(false);

      // Notify parent component
      if (onStopStream) {
        onStopStream();
      }

      console.log("Stream stopped successfully");

      // Camera and microphone are now fully stopped; do not start preview again
    } catch (err) {
      console.error("Error stopping stream:", err);
      setError("Failed to stop stream: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      {!actId || actId === "undefined" ? (
        <div className={styles.errorContainer}>
          <h2>Stream Setup Error</h2>
          <p>Unable to initialize stream: Act ID is missing or invalid.</p>
          <p>Please try creating a new act.</p>
          <button className={styles.button} onClick={onStopStream}>
            Go Back
          </button>
        </div>
      ) : (
        <>
          <div className={styles.infoBox}>
            <p>
              <strong>Status:</strong>{" "}
              {isStreaming ? (
                <span className={styles.statusLive}>🔴 LIVE</span>
              ) : (
                <span className={styles.statusPreparing}>⚪ OFFLINE</span>
              )}
            </p>
            {showIntro && (
              <p>
                <strong>▶️ Playing Intro Video</strong>
              </p>
            )}
            {showOutro && (
              <p>
                <strong>▶️ Playing Outro Video</strong>
              </p>
            )}
            {isStreaming &&
              !showIntro &&
              !showOutro &&
              actData?.musics?.length > 0 && (
                <p>
                  <strong>🎵 Background Music Playing</strong>
                </p>
              )}
          </div>
          <div className={styles.videoContainer}>
            {/* Hidden intro video for capture */}
            <video
              ref={introVideoRef}
              crossOrigin="anonymous"
              playsInline
              style={{ display: "none" }}
            />

            {/* Hidden outro video for capture */}
            <video
              ref={outroVideoRef}
              crossOrigin="anonymous"
              playsInline
              style={{ display: "none" }}
            />

            {/* Hidden audio element for background music */}
            <audio
              ref={musicAudioRef}
              crossOrigin="anonymous"
              style={{ display: "none" }}
            />

            {/* Main stream video */}
            <div
              ref={localVideoRef}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>

          <div className={styles.controls}>
            <button
              className={styles.button}
              onClick={isStreaming ? stopStreaming : startStreaming}
              disabled={isInitializingRef.current}
            >
              {isStreaming ? "Stop Stream" : "Start Stream"}
            </button>
            <button
              className={styles.button}
              onClick={onStopStream}
              disabled={isStreaming}
            >
              Exit
            </button>
          </div>

          <div className={styles.infoText}>
            <p>
              {isStreaming
                ? "Your camera and microphone are now live!"
                : 'Click "Start Stream" to go live. Make sure your camera and microphone are connected.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default StreamHost;
