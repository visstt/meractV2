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
    // Check authentication from store
    if (!isAuthenticated) {
      // Additionally check cookie (for compatibility)
      const token = getCookie("access_token");
      if (token) {
        // If token exists in cookie but not in store, update store
        login({ token });
      } else {
        // If no token anywhere, redirect to login
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, navigate, login]);

  // If user is not authenticated, render nothing
  if (!isAuthenticated && !getCookie("access_token")) {
    return null;
  }

  return children;
}
