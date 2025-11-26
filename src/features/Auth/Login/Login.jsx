import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import styles from "./Login.module.css";
import { useAuth } from "./hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Перенаправляем если пользователь уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/acts");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await signIn(email, password);
    if (ok) navigate("/acts");
  };

  return (
    <div className={styles.login_wrapper}>
      <h1>MERACT</h1>
      <form
        className={styles.login_form}
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div className={styles.input_wrapper}>
          <input
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className={styles.checkbox_wrapper}>
          <input type="checkbox" id="check" />
          <label htmlFor="check">Remember Password</label>
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/forgot-password");
          }}
        >
          Forget Password?
        </a>
        <button
          type="submit"
          className={styles.login_button}
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>
        {error && (
          <p style={{ color: "#ff6a6a", marginTop: 8, textAlign: "center" }}>
            {error}
          </p>
        )}
        <p
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => navigate("/registration")}
        >
          SIGN UP
        </p>
      </form>
      <p>OR</p>
      <div className={styles.ico_wrapper}>
        <div
          className={styles.ico}
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
          }}
          style={{ cursor: "pointer" }}
        >
          <img src="/icons/google.svg" alt="Google Icon" width={22} />
        </div>
      </div>
    </div>
  );
}
