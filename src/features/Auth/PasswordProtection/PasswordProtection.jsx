import React, { useEffect, useState } from "react";

import styles from "./PasswordProtection.module.css";

const PasswordProtection = ({ children }) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem("sitePasswordAuth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const correctPassword = "meract2025";

    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError("");
      localStorage.setItem("sitePasswordAuth", "true");
    } else {
      setError("Неверный пароль");
      setPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>MERACT</h1>
            <p className={styles.subtitle}>
              Enter your password to access the site
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className={styles.input}
                autoFocus
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.button}>
              Login
            </button>
          </form>

          <div className={styles.footer}>
            <p>A password is required to access the site.</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PasswordProtection;
