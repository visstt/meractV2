import { useState } from "react";

import { useNavigate } from "react-router-dom";

import styles from "../Login/Login.module.css";
import { useSignUp } from "./hooks/useSignUp";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, loading, error, success } = useSignUp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await signUp(email, password);
    if (ok) setTimeout(() => navigate("/acts"), 1500);
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
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || success}
          />
          <div className={styles.checkbox_wrapper}>
            <input type="checkbox" id="check" />
            <label htmlFor="check">Remember Password</label>
          </div>
        </div>
        <button
          type="submit"
          className={styles.login_button}
          disabled={loading || !email || !password || success}
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
        {error && (
          <p style={{ color: "#ff6a6a", marginTop: 8, textAlign: "center" }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: "#58d0ff", marginTop: 16, textAlign: "center" }}>
            Registration successful!
          </p>
        )}
        <p
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => navigate("/login")}
        >
          SIGN IN
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
