import { useEffect } from "react";

import { BrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PasswordProtection from "../features/Auth/PasswordProtection/PasswordProtection";
import { useAuthStore } from "../shared/stores/authStore";
import AchievementNotificationContainer from "../shared/ui/AchievementNotificationContainer/AchievementNotificationContainer";
import "./App.css";
import { router } from "./router/Routers";

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function App() {
  const { logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Проверяем наличие токенов в cookies при загрузке
    const accessToken = getCookie("access_token");
    const refreshToken = getCookie("refresh_token");

    // Если пользователь считается авторизованным, но токенов нет - выходим
    if (isAuthenticated && !accessToken && !refreshToken) {
      console.log("🚪 No tokens in cookies, logging out...");
      logout();
      window.location.href = "/login";
    }
  }, [isAuthenticated, logout]);

  return (
    <PasswordProtection>
      <RouterProvider router={router} />
      <AchievementNotificationContainer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </PasswordProtection>
  );
}

export default App;
