import React, { useEffect, useState } from "react";

import { Navigate, useNavigate } from "react-router-dom";

import api from "../../shared/api/api";
import { useSequelStore } from "../../shared/stores/sequelStore";
import CustomSelect from "../../shared/ui/CustomSelect";
import NavBar from "../../shared/ui/NavBar/NavBar";
import styles from "./ActsPage.module.css";
import ActCard from "./components/ActCard";

export default function ActsPage() {
  const [acts, setActs] = useState([
    {
      id: 1,
      title: "Voices in the Crowd",
      description:
        "Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing",
      navigator: "Graphite8",
      heroes: ["Graphite8", "NeonFox", "ShadowWeave", "EchoStorm1"],
      location: "Puerto de la Cruz (ES)",
      distance: "2,500km Away",
      upvotes: 12,
      downvotes: 12,
      liveIn: "2h 15m",
      isMock: true,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { clearAll } = useSequelStore();

  useEffect(() => {
    localStorage.removeItem("createActFormState");
    clearAll();
  }, [clearAll]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/act/get-acts")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setActs((prev) => [
            prev[0],
            ...res.data.map((act) => ({
              ...act,
              title: act.name,
              description: act.status,
              navigator: act.user,
              location: act.category,
              distance: act.duration,
              upvotes: 0,
              downvotes: 0,
              liveIn: act.duration,
              isMock: false,
            })),
          ]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Error loading acts");
        setLoading(false);
      });
  }, []);

  const handleSortChange = (option) => {
    console.log("Selected sort option:", option);
  };
  const navigate = useNavigate();

  const handleAddAct = () => {
    navigate("/create-act");
  };

  return (
    <div>
      <div className="header">
        <div className="name">
          <img src="/icons/back_arrow.svg" alt="back_arrow" />
          <h1>ACTS</h1>
        </div>
        <div className="nav">
          <input type="text" placeholder="Search..." />
          <img src="/icons/bell.svg" alt="bell" />
        </div>
      </div>
      <div className="stripe"></div>

      <div className={styles.actsPage}>
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
          <button
            onClick={() => {
              handleAddAct();
            }}
            className={styles.addActButton}
          >
            ADD ACT
          </button>
        </form>

        <div className={styles.streamsList}>
          {acts && acts.length > 0 ? (
            acts.map((act, index) => (
              <ActCard
                key={
                  act.id
                    ? `act-${act.id}`
                    : `fallback-${index}-${Math.random()}`
                }
                act={{
                  ...act,
                  title: act.title || act.name || "Untitled",
                  description:
                    act.description || act.status || "No description",
                  navigator: act.navigator || act.user || "Not specified",
                  location: act.location || act.category || "Not specified",
                  distance: act.distance || act.duration || "Not specified",
                  previewFileName: act.previewFileName || "",
                  imageUrl:
                    act.imageUrl ||
                    (act.previewFileName ? act.previewFileName : undefined),
                  upvotes: typeof act.upvotes === "number" ? act.upvotes : 0,
                  downvotes:
                    typeof act.downvotes === "number" ? act.downvotes : 0,
                  liveIn: act.liveIn || act.duration || "",
                  isMock: act.isMock || false,
                }}
              />
            ))
          ) : (
            <div>No acts available</div>
          )}
        </div>
        <NavBar />
      </div>
    </div>
  );
}
