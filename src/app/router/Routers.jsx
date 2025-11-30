import { useEffect } from "react";

import {
  Navigate,
  createBrowserRouter,
  useSearchParams,
} from "react-router-dom";

import Login from "../../features/Auth/Login/Login";
import RequireAuth from "../../features/Auth/RequireAuth";
import ForgotPassword from "../../features/Auth/forgotPassword/ForgotPassword";
import SignUp from "../../features/Auth/registration/SignUp";
import AchievementsPage from "../../pages/achievements/AchievementsPage";
import ActsPage from "../../pages/acts/ActsPage";
import CreateAct from "../../pages/createAct/CreateAct";
import GuildDetailPage from "../../pages/guilds/GuildDetailPage";
import GuildsPage from "../../pages/guilds/GuildsPage";
import RankPage from "../../pages/rank/RankPage";
import SceneControlIntro from "../../pages/sceneControl/intro/SceneControlIntro";
import SelectSequel from "../../pages/sceneControl/intro/SelectSequel/SelectSequel";
import SceneControlMusic from "../../pages/sceneControl/music/SceneControlMusic";
import SelectMusic from "../../pages/sceneControl/music/selectMusic/SelectMusic";
import SceneControlOutro from "../../pages/sceneControl/outro/SceneControlOutro";
import SceneControlTransition from "../../pages/sceneControl/transition/SceneControlTransition";
import StreamPage from "../../pages/stream/StreamPage";
import StreamHostPage from "../../pages/streamHost/StreamHostPage";
import { useAuthStore } from "../../shared/stores/authStore";

// Component for smart redirect with Google OAuth handling
const HomeRedirect = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    // Проверяем наличие данных пользователя в query параметрах (после Google OAuth)
    const userParam = searchParams.get("user");

    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        console.log("Google OAuth user data received:", userData);

        // Сохраняем пользователя в store
        // Токены уже установлены через cookies бэкендом
        login(userData);

        // Удаляем параметр из URL для чистоты
        window.history.replaceState({}, document.title, "/acts");
      } catch (error) {
        console.error("Error parsing user data from Google OAuth:", error);
      }
    }
  }, [searchParams, login]);

  return <Navigate to={isAuthenticated ? "/acts" : "/login"} replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    path: "/acts",
    element: (
      <RequireAuth>
        <ActsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/guilds",
    element: (
      <RequireAuth>
        <GuildsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/guilds/:id",
    element: (
      <RequireAuth>
        <GuildDetailPage />
      </RequireAuth>
    ),
  },
  {
    path: "/achievements",
    element: (
      <RequireAuth>
        <AchievementsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/rank",
    element: (
      <RequireAuth>
        <RankPage />
      </RequireAuth>
    ),
  },
  {
    path: "/scene-control-intro",
    element: <SceneControlIntro />,
  },
  {
    path: "/scene-control-transition",
    element: <SceneControlTransition />,
  },
  {
    path: "/scene-control-music",
    element: <SceneControlMusic />,
  },
  {
    path: "/scene-control-music-select",
    element: <SelectMusic />,
  },
  {
    path: "/scene-control-sequel-select",
    element: <SelectSequel />,
  },
  {
    path: "/scene-control-outro",
    element: <SceneControlOutro />,
  },
  {
    path: "/create-act",
    element: <CreateAct />,
  },
  {
    path: "/stream-host/:id",
    element: (
      <RequireAuth>
        <StreamHostPage />
      </RequireAuth>
    ),
  },
  {
    path: "/stream/:id",
    element: <StreamPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/registration",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
]);
