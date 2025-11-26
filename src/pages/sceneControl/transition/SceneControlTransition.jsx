import { useNavigate } from "react-router-dom";

import styles from "../SceneControl.module.css";

export default function SceneControlTransition() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/create-act");
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
            <h1>Scene Control</h1>
          </div>
        </div>
        <div className="stripe2"></div>
        <div className={styles.content}>
          <img
            src="/images/samplePhoto.png"
            alt=""
            className={styles.samplePhoto}
          />

          <div className="btnRow">
            <button
              type="button"
              className={styles.selectBtn}
              onClick={() => navigate("/scene-control-intro")}
            >
              <img src="/icons/intro.svg" alt="intro" />
              Intro
            </button>
            <button
              type="button"
              className={`${styles.selectBtn} ${styles.selectBtnActive}`}
              style={{ paddingBottom: "7px" }}
              onClick={() => navigate("/scene-control-transition")}
            >
              <img src="/icons/flash.svg" alt="transition" />
              Transition
            </button>
            <button
              type="button"
              className={styles.selectBtn}
              onClick={() => navigate("/scene-control-music")}
            >
              <img src="/icons/music.svg" alt="music" />
              Music
            </button>
            <button
              type="button"
              className={styles.selectBtn}
              onClick={() => navigate("/scene-control-outro")}
            >
              <img src="/icons/outro.svg" alt="outro" />
              Outro
            </button>
          </div>

          <div className={styles.wrapper}>
            <div className={styles.wrapper_header}>
              <p>Transition</p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                color: "#fff",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  padding: "40px 30px",
                  maxWidth: "400px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "20px",
                  }}
                ></div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    color: "#fff",
                  }}
                >
                  Under Development
                </h2>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#ccc",
                    lineHeight: "1.5",
                    marginBottom: "8px",
                  }}
                >
                  This feature is currently being developed and will be
                  available soon.
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#999",
                    lineHeight: "1.4",
                  }}
                >
                  Thank you for your patience!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
