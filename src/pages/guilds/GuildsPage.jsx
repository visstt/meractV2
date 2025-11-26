import CustomSelect from "../../shared/ui/CustomSelect";
import NavBar from "../../shared/ui/NavBar/NavBar";
import styles from "./GuildsPage.module.css";
import GuildCard from "./components/GuildCard";

export default function GuildsPage() {
  const handleSortChange = (option) => {
    console.log("Selected sort option:", option);
  };
  return (
    <div>
      <div className="header">
        <div className="name">
          <img src="/icons/back_arrow.svg" alt="back_arrow" />
          <h1>GUILDS</h1>
        </div>
        <div className="nav">
          <input type="text" placeholder="Search..." />
          <img src="/icons/bell.svg" alt="bell" />
        </div>
      </div>
      <div className="stripe"></div>

      <div className={styles.guildsPage}>
        <form className={styles.form}>
          <CustomSelect
            defaultValue="Language"
            options={["English", "Spanish"]}
            onChange={handleSortChange}
          />
          <CustomSelect
            defaultValue="Proximity"
            options={["Proximity", "Proximity"]}
            onChange={handleSortChange}
          />
          <CustomSelect
            defaultValue="Act Status"
            options={["Active", "Inactive"]}
            onChange={handleSortChange}
          />
          <CustomSelect
            defaultValue="Sort By"
            options={[
              "By Proximity",
              "By Votes",
              "By Viewer Number",
              "By Number of Bidder",
              "By Comments",
            ]}
            onChange={handleSortChange}
          />

          <CustomSelect
            defaultValue="Guild-initiated acts"
            options={["Active", "Inactive"]}
            onChange={handleSortChange}
          />
          <CustomSelect
            defaultValue="Hero Type"
            options={["Active", "Inactive"]}
            onChange={handleSortChange}
          />
        </form>

        <div className={styles.recommendations}>
          <div className={styles.stripeDefault}></div>
          <p>Recommended for You</p>
          <div className={styles.stripeDefault}></div>
        </div>

        <div className={styles.guildCards}>
          <GuildCard />
          <GuildCard />
          <GuildCard />
        </div>
      </div>
      <NavBar />
    </div>
  );
}
