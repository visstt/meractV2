import { useState } from "react";

import { useNavigate } from "react-router-dom";

import styles from "../Login/Login.module.css";
import { useChangePassword } from "./hooks/useChangePassword";
import { useForgotPassword } from "./hooks/useForgotPassword";
import { useVerifyCode } from "./hooks/useVerifyCode";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState(null);
  const [password, setPassword] = useState("");

  const {
    sendCode,
    loading: loadingEmail,
    error: errorEmail,
  } = useForgotPassword();
  const {
    verifyCode,
    loading: loadingCode,
    error: errorCode,
  } = useVerifyCode();
  const {
    changePassword,
    loading: loadingPassword,
    error: errorPassword,
  } = useChangePassword();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const ok = await sendCode(email);
    if (ok) setStep(2);
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    const res = await verifyCode(code, "forgot-password");
    if (res?.userId) {
      setUserId(res.userId);
      setStep(3);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const ok = await changePassword(userId, password);
    if (ok) {
      setStep(4);
      setTimeout(() => navigate("/acts"), 1500);
    }
  };

  return (
    <div className={styles.login_wrapper}>
      <h1>Forgot Password</h1>
      <form className={styles.login_form} autoComplete="off">
        {step === 1 && (
          <>
            <div className={styles.input_wrapper}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingEmail}
              />
            </div>
            <button
              type="submit"
              className={styles.login_button}
              disabled={loadingEmail || !email}
              onClick={handleEmailSubmit}
            >
              {loadingEmail ? "Sending..." : "Send Code"}
            </button>
            {errorEmail && (
              <p
                style={{ color: "#ff6a6a", marginTop: 8, textAlign: "center" }}
              >
                {errorEmail}
              </p>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <div className={styles.input_wrapper}>
              <input
                type="text"
                placeholder="Enter code from email"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loadingCode}
              />
            </div>
            <button
              type="submit"
              className={styles.login_button}
              disabled={loadingCode || !code}
              onClick={handleCodeSubmit}
            >
              {loadingCode ? "Verifying..." : "Verify Code"}
            </button>
            {errorCode && (
              <p
                style={{ color: "#ff6a6a", marginTop: 8, textAlign: "center" }}
              >
                {errorCode}
              </p>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <div className={styles.input_wrapper}>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loadingPassword}
              />
            </div>
            <button
              type="submit"
              className={styles.login_button}
              disabled={loadingPassword || !password}
              onClick={handlePasswordSubmit}
            >
              {loadingPassword ? "Changing..." : "Change Password"}
            </button>
            {errorPassword && (
              <p
                style={{ color: "#ff6a6a", marginTop: 8, textAlign: "center" }}
              >
                {errorPassword}
              </p>
            )}
          </>
        )}
        {step === 4 && (
          <p style={{ color: "#58d0ff", marginTop: 16, textAlign: "center" }}>
            Password changed successfully!
          </p>
        )}
      </form>
    </div>
  );
}
