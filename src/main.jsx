import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { initializeTheme } from "./utils/theme";
import { ProjectsProvider } from "./context/ProjectsContext";
import { ThemeProvider } from "@/context/ThemeContext";

initializeTheme();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <ThemeProvider>
      <ProjectsProvider>
        <App />
      </ProjectsProvider>
    </ThemeProvider>
  </BrowserRouter>
);


