import styles from "./GuildCard.module.css";

export default function GuildCard({ guild }) {
  return (
    <div
      className={styles.guildCard}
      style={{
        backgroundImage: `url(${guild.logoFileName || "/images/guildCardBg.png"}), linear-gradient(180deg, rgba(9, 84, 134, 0.45) 0%, rgba(9, 84, 134, 0) 15%), linear-gradient(180deg, #095486 37.4%, rgba(115, 115, 115, 0) 79.9%)`,
      }}
    >
      <img
        src="/icons/link_icon.svg"
        alt="link_icon"
        className={styles.link_icon}
      />
      <div className={styles.content}>
        <img
          src="/icons/guild/light.svg"
          alt="guild logo"
          className={styles.light}
        />
        <div className={styles.name}>
          <h1>{guild.name}</h1>
        </div>
        <div className={styles.description}>
          <p>{guild.description || "No description available"}</p>
        </div>
        <div className={styles.info}>
          <p>Guild Acts</p>
          <h2>145/179</h2>
        </div>
        <input
          type="text"
          placeholder="Here is a sample message..."
          className={styles.input}
        />
      </div>
      <div className={styles.stripe}></div>
      <div className={styles.statistic}>
        <div className={styles.block}>
          <p>Member</p>
          <h3>{guild.members?.length || 0}</h3>
        </div>
        <div className={styles.block}>
          <p>Prospects</p>
          <h3>120</h3>
        </div>
        <div className={styles.block}>
          <p>Tag</p>
          <h3>Tactical, Social...</h3>
        </div>
      </div>
    </div>
  );
}
