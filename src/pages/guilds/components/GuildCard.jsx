import styles from "./GuildCard.module.css";

export default function GuildCard() {
  return (
    <div className={styles.guildCard}>
      <img
        src="/icons/link_icon.svg"
        alt="link_icon"
        className={styles.link_icon}
      />
      <div className={styles.content}>
        <img
          src="/icons/guild/light.svg"
          alt="light"
          className={styles.light}
        />
        <div className={styles.name}>
          <h1>Guild Name</h1>
        </div>
        <div className={styles.description}>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo
            fugiat reiciendis culpa
          </p>
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
          <h3>1,600</h3>
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
