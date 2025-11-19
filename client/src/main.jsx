import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/layout.css";
import "./styles/board.css";
import "./styles/buttons.css";

createRoot(document.getElementById("root")).render(<App />);
