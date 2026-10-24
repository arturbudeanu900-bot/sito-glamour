import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MariannaJ from "./MariannaJ";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MariannaJ />
  </StrictMode>,
);
