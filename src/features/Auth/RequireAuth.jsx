import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../shared/stores/authStore";

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function RequireAuth({ children }) {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      const token = getCookie("access_token");
      if (token) {
        login({ token });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, navigate, login]);

  if (!isAuthenticated && !getCookie("access_token")) {
    return null;
  }

  return children;
}
