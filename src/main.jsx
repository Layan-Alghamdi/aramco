import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { initializeTheme } from "./utils/theme";
import { ProjectsProvider } from "./context/ProjectsContext";

initializeTheme();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <ProjectsProvider>
      <App />
    </ProjectsProvider>
  </BrowserRouter>
);


