import { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import styles from "./SelectMusic.module.css";
import { useMusic } from "./hooks/useMusic";
import { useUploadMusic } from "./hooks/useUploadMusic";
import { extractMusicTitle } from "./utils/musicUtils";

export default function SelectMusic() {
  const [selectedMusic, setSelectedMusic] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioElements, setAudioElements] = useState({});

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { music, loading, error, refetch } = useMusic();
  const { uploadMusicFile, uploadMusicFromUrl, isUploading, uploadError } =
    useUploadMusic();

  const handleGoBack = () => {
    navigate("/create-act");
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const success = await uploadMusicFile(file);
      if (success) {
        refetch(); 
        event.target.value = ""; 
      }
    }
  };

  const handleUrlUpload = async () => {
    if (musicUrl.trim()) {
      const success = await uploadMusicFromUrl(musicUrl.trim());
      if (success) {
        refetch(); 
        setMusicUrl(""); 
      }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handlePlayPause = (track) => {
    const trackId = track.id;

    if (currentlyPlaying === trackId) {
      const audio = audioElements[trackId];
      if (audio && !audio.paused) {
        audio.pause();
        setCurrentlyPlaying(null);
        return;
      }
    }

    Object.values(audioElements).forEach((audio) => {
      if (audio && !audio.paused) {
        audio.pause();
      }
    });

    let audio = audioElements[trackId];
    if (!audio) {
      audio = new Audio(track.fileName);
      audio.addEventListener("ended", () => {
        setCurrentlyPlaying(null);
      });
      audio.addEventListener("error", (e) => {
        console.error("Error playing audio:", e);
        setCurrentlyPlaying(null);
      });

      setAudioElements((prev) => ({
        ...prev,
        [trackId]: audio,
      }));
    }

    audio
      .play()
      .then(() => {
        setCurrentlyPlaying(trackId);
      })
      .catch((error) => {
        console.error("Error playing audio:", error);
        setCurrentlyPlaying(null);
      });
  };

  const handleSelectMusic = (musicId) => {
    setSelectedMusic((prev) => {
      if (prev.includes(musicId)) {
        return prev.filter((id) => id !== musicId);
      } else {
        return [...prev, musicId];
      }
    });
  };

  const filteredMusic = music.filter((track) => {
    const title = extractMusicTitle(track.fileName).toLowerCase();
    return title.includes(searchTerm.toLowerCase());
  });
  const UploadIcon = () => {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.50008 13.3333H12.5001V8.33333H15.8334L10.0001 2.5L4.16675 8.33333H7.50008V13.3333ZM4.16675 15H15.8334V16.6667H4.16675V15Z"
          fill="white"
        />
      </svg>
    );
  };

  const Stripe = () => {
    return (
      <svg
        width="1"
        height="30"
        viewBox="0 0 1 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.5 0C0.5 11.7157 0.5 18.2843 0.5 30"
          stroke="white"
          stroke-opacity="0.7"
          stroke-dasharray="2 2"
        />
      </svg>
    );
  };
  const SearchIcon = () => {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.146 12.3707 1.888 11.112C0.63 9.85333 0.000667196 8.316 5.29101e-07 6.5C-0.000666138 4.684 0.628667 3.14667 1.888 1.888C3.14733 0.629333 4.68467 0 6.5 0C8.31533 0 9.853 0.629333 11.113 1.888C12.373 3.14667 13.002 4.684 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.81267 10.5627 9.688 9.688C10.5633 8.81333 11.0007 7.75067 11 6.5C10.9993 5.24933 10.562 4.187 9.688 3.313C8.814 2.439 7.75133 2.00133 6.5 2C5.24867 1.99867 4.18633 2.43633 3.313 3.313C2.43967 4.18967 2.002 5.252 2 6.5C1.998 7.748 2.43567 8.81067 3.313 9.688C4.19033 10.5653 5.25267 11.0027 6.5 11Z"
          fill="white"
        />
      </svg>
    );
  };
  const Play = ({ isCurrentlyPlaying }) => {
    if (isCurrentlyPlaying) {
      return (
        <svg
          width="13"
          height="16"
          viewBox="0 0 13 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="1" y="1" width="3" height="14" fill="white" />
          <rect x="8" y="1" width="3" height="14" fill="white" />
        </svg>
      );
    }

    return (
      <svg
        width="13"
        height="16"
        viewBox="0 0 13 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.524 0.937344L11.616 7.14734C11.7616 7.23681 11.8818 7.3621 11.9653 7.51126C12.0487 7.66041 12.0925 7.82845 12.0925 7.99934C12.0925 8.17024 12.0487 8.33828 11.9653 8.48743C11.8818 8.63659 11.7616 8.76187 11.616 8.85134L1.524 15.0613C1.37245 15.1546 1.19878 15.2057 1.02088 15.2094C0.842993 15.2131 0.667332 15.1693 0.512025 15.0825C0.356717 14.9957 0.227388 14.869 0.137382 14.7155C0.0473748 14.562 -5.0094e-05 14.3873 3.97067e-08 14.2093V1.78934C-5.0094e-05 1.61141 0.0473748 1.43669 0.137382 1.28321C0.227388 1.12972 0.356717 1.00303 0.512025 0.916205C0.667332 0.82938 0.842993 0.785565 1.02088 0.789281C1.19878 0.792997 1.37245 0.844109 1.524 0.937344Z"
          fill="white"
        />
      </svg>
    );
  };
  return (
    <div>
      <div className={styles.glass}>
        <div className={styles.header}>
          <div className={styles.name}>
            <img
              src="/icons/back_arrowV2.svg"
              alt="back_arrow"
              style={{ cursor: "pointer" }}
              onClick={handleGoBack}
            />
            <h1>Select Music</h1>
          </div>
        </div>
        <div className="stripe2"></div>
        <div className={styles.upload_section}>
          <button
            className={styles.upload_button}
            onClick={handleFileButtonClick}
            disabled={isUploading}
          >
            <UploadIcon />
            {isUploading ? "Uploading..." : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <Stripe />
          <div className={styles.input_container}>
            <input
              type="text"
              placeholder="Paste Link to add"
              className={styles.music_input}
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              disabled={isUploading}
            />
            <button
              className={styles.add_button}
              onClick={handleUrlUpload}
              disabled={isUploading || !musicUrl.trim()}
            >
              {isUploading ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
        {uploadError && (
          <div className={styles.error_message}>Error: {uploadError}</div>
        )}
        <div className="stripe2" style={{ margin: 0 }}></div>

        <div className={styles.list_section}>
          <div className={styles.search_container}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search"
              className={styles.search_input}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading && (
            <div
              style={{
                color: "#fff",
                textAlign: "center",
                padding: "20px",
              }}
            >
              Loading music...
            </div>
          )}

          {error && (
            <div
              style={{
                color: "#ff6b6b",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <p>Error: {error}</p>
              <button
                onClick={refetch}
                style={{
                  background: "#3ABAFF",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            filteredMusic.length === 0 &&
            music.length > 0 && (
              <div
                style={{
                  color: "#999",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No music found matching your search
              </div>
            )}

          {!loading && !error && music.length === 0 && (
            <div
              style={{
                color: "#999",
                textAlign: "center",
                padding: "20px",
              }}
            >
              No music available
            </div>
          )}

          {!loading &&
            !error &&
            filteredMusic.map((track) => (
              <div key={track.id} className={styles.music_block}>
                <div className={styles.music_name}>
                  <button
                    className={styles.play_button}
                    onClick={() => handlePlayPause(track)}
                  >
                    <Play isCurrentlyPlaying={currentlyPlaying === track.id} />
                  </button>
                  <p>{extractMusicTitle(track.fileName)}</p>
                </div>
                <div className={styles.music_info}>
                  <p>{track.length}</p>
                  <button
                    className={
                      selectedMusic.includes(track.id)
                        ? `${styles.select_btn} ${styles.active}`
                        : styles.select_btn
                    }
                    onClick={() => handleSelectMusic(track.id)}
                  >
                    {selectedMusic.includes(track.id) ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
