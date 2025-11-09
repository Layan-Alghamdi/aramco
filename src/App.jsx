import React from "react";
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

const ProtectedRoute = ({ children }) => {
  const isAuth = typeof window !== "undefined" && localStorage.getItem("isAuth") === "1";
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


