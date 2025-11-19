import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import CreateProject from "./pages/CreateProject";
import Projects from "./pages/Projects";
import Editor from "./pages/Editor";
import Notifications from "./pages/Notifications";
import Features from "./pages/Features";
import About from "./pages/About";
import NewTeam from "./pages/NewTeam";
import TeamOverview from "./pages/TeamOverview";
import EditTeam from "./pages/EditTeam";
import ChangePassword from "./pages/ChangePassword";
import NotificationPreferences from "./pages/NotificationPreferences";
import ThemePreferences from "./pages/ThemePreferences";
import AramatrixAI from "./pages/AramatrixAI";
import ChatAssistant from "./components/ChatAssistant";
import {
  applyTheme,
  initializeTheme,
  loadThemePreference,
  subscribeToSystemTheme,
  THEME_STORAGE_KEY
} from "./lib/theme";

const ProtectedRoute = ({ children }) => {
  const isAuth = typeof window !== "undefined" && localStorage.getItem("isAuth") === "1";
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  useEffect(() => {
    initializeTheme();

    const unsubscribeSystem = subscribeToSystemTheme(() => {
      if (loadThemePreference() === "system") {
        applyTheme("system");
      }
    });

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        const preference = loadThemePreference();
        applyTheme(preference);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      unsubscribeSystem();
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/features" element={<Features />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/notifications"
        element={
          <ProtectedRoute>
            <NotificationPreferences />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/theme"
        element={
          <ProtectedRoute>
            <ThemePreferences />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aramatrix-ai"
        element={
          <ProtectedRoute>
            <AramatrixAI />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:projectId"
        element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams/new"
        element={
          <ProtectedRoute>
            <NewTeam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams/:teamId"
        element={
          <ProtectedRoute>
            <TeamOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams/:teamId/edit"
        element={
          <ProtectedRoute>
            <EditTeam />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatAssistant />
    </>
  );
}


