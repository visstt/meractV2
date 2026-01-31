import { useNavigate } from "react-router-dom";

import styles from "./ActCard.module.css";

export default function ActCard({ act }) {
  const navigate = useNavigate();

  console.log("ActCard received act:", act);

  const handleCardClick = () => {
    navigate(`/stream/${act.id}`, { state: { act } });
  };

  if (act.isMock) {
    return (
      <div className={styles.actCard} onClick={handleCardClick}>
        <h1>Voices in the Crowd </h1>
        <h3>
          Lorem ipsum is a dummy or placeholder text commonly used in graphic
          design, publishing
        </h3>
        <p>
          Navigator: Graphite8 ; Hero: Graphite8, NeonFox, ShadowWeave,
          EchoStorm1
        </p>

        <div className={styles.stripe}></div>
        <div className={styles.blocks}>
          <p>Puerto de la Cruz (ES)</p>
          <p>2,500km Away</p>
        </div>

        <div className={styles.info}>
          <div className={styles.arrows}>
            <span className={styles.arrow}>
              <img src="/icons/arrowUp.svg" alt="arrow" />
              <h2>12</h2>
            </span>
            <span className={styles.arrow}>
              <img src="/icons/arrowDown.svg" alt="arrow" />
              <h2>12</h2>
            </span>
          </div>

          <h4>Live in 2h 15m</h4>
        </div>

        <img
          src="/icons/link_icon.svg"
          alt="link_icon"
          className={styles.linkIcon}
        />
        <img
          src="/icons/favorites_icon.png"
          alt="favorites_icon"
          className={styles.favoritesIcon}
        />
      </div>
    );
  }

  let imageUrl = act.imageUrl;
  if (!imageUrl && act.previewFileName) {
    imageUrl = `/uploads/${act.previewFileName}`;
  }
  const cardStyle = imageUrl
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {};

  return (
    <div className={styles.actCard} style={cardStyle} onClick={handleCardClick}>
      {imageUrl && <div className={styles.overlay} />}
      <h1>{act.title}</h1>
      <h3>{act.description}</h3>
      <p>
        Type: {act.type} | Format: {act.format}
        {act.spotAgentCount > 0 && ` | Spot Agents: ${act.spotAgentCount}`}
      </p>
      <p>
        Hero: {act.heroMethods} | Navigator: {act.navigatorMethods}
        {act.spotAgentMethods && ` | Spot Agent: ${act.spotAgentMethods}`}
      </p>

      <div className={styles.stripe}></div>
      <div className={styles.blocks}>
        <p>{act.location}</p>
        <p>{act.distance}</p>
      </div>

      <div className={styles.info}>
        <div className={styles.arrows}>
          <span className={styles.arrow}>
            <img src="/icons/arrowUp.svg" alt="arrow" />
            <h2>{act.upvotes}</h2>
          </span>
          <span className={styles.arrow}>
            <img src="/icons/arrowDown.svg" alt="arrow" />
            <h2>{act.downvotes}</h2>
          </span>
        </div>

        <h4>{act.liveIn}</h4>
      </div>

      <img
        src="/icons/link_icon.svg"
        alt="link_icon"
        className={styles.linkIcon}
      />
      <img
        src="/icons/favorites_icon.png"
        alt="favorites_icon"
        className={styles.favoritesIcon}
      />
    </div>
  );
}
