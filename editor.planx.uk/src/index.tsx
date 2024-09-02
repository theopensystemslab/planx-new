import "core-js/actual/string/replace-all"; // replace-all polyfill
import "./app.css";

import App from "App";
import React from "react";
import { createRoot } from "react-dom/client";

import * as airbrake from "./airbrake";
// init airbrake before everything else

if (import.meta.env.VITE_APP_ENV !== "production") {
  console.log(`ENV: ${import.meta.env.VITE_APP_ENV}`);
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(<App />);
