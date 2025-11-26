import { BrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PasswordProtection from "../features/Auth/PasswordProtection/PasswordProtection";
import AchievementNotificationContainer from "../shared/ui/AchievementNotificationContainer/AchievementNotificationContainer";
import "./App.css";
import { router } from "./router/Routers";

function App() {
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
