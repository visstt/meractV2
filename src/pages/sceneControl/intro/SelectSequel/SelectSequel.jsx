import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useSequelStore } from "../../../../shared/stores/sequelStore";
import styles from "./SelectSequel.module.css";
import useSequels from "./hooks/useSequels";

export default function SelectSequel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSequelId, setSelectedSequelId] = useState(null);
  const { sequels, loading, error } = useSequels();
  const { setSelectedSequel } = useSequelStore();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/create-act");
  };

  const handleSequelSelect = (sequel) => {
    console.log("Selected sequel:", sequel);
    setSelectedSequelId(sequel.id);
    // Сохраняем выбранный сиквел в стор
    setSelectedSequel(sequel);
  };

  const handleAddToAct = (event) => {
    event.stopPropagation(); // Предотвращаем вызов handleSequelSelect
    console.log("handleAddToAct called, selectedSequelId:", selectedSequelId);
    if (selectedSequelId) {
      console.log("Adding sequel to act:", selectedSequelId);
      console.log("Navigating to /create-act");
      // Переходим на страницу создания акта (сиквел уже сохранен в сторе)
      navigate("/create-act");
    } else {
      alert("Please select a sequel first");
    }
  };

  // Фильтрация сиквелов по поисковому запросу
  const filteredSequels = sequels.filter((sequel) =>
    sequel.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
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
            <h1>Add to Existing Sequel</h1>
          </div>
        </div>
        <div className="stripe2"></div>
        <div className={styles.container}>
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
        </div>
        <div className="stripe2" style={{ margin: 0 }}></div>
        <div className={styles.content}>
          <h3>Select Sequel</h3>

          {loading && <p>Loading sequels...</p>}

          {error && (
            <div className={styles.error}>
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && filteredSequels.length === 0 && (
            <p>No sequels found</p>
          )}

          {!loading &&
            !error &&
            filteredSequels.map((sequel) => (
              <div
                key={sequel.id}
                className={`${styles.sequel_block} ${selectedSequelId === sequel.id ? styles.selected : ""}`}
                onClick={() => handleSequelSelect(sequel)}
              >
                <div className={styles.start}>
                  <img
                    src={sequel.coverFileName || "/images/samplePhoto.png"}
                    alt={sequel.title}
                    onError={(e) => {
                      e.target.src = "/images/samplePhoto.png";
                    }}
                  />
                  <div className={styles.sequel_name}>
                    <h4>{sequel.title}</h4>
                    <p>Total Episode: {sequel.episodes}</p>
                  </div>
                </div>

                <img
                  src="/icons/plus.svg"
                  alt="plus"
                  width={15}
                  style={{
                    marginRight: 10,
                    cursor: selectedSequelId ? "pointer" : "not-allowed",
                    opacity: selectedSequelId ? 1 : 0.5,
                    filter:
                      selectedSequelId === sequel.id
                        ? "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)"
                        : "none",
                  }}
                  onClick={(e) => selectedSequelId && handleAddToAct(e)}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
