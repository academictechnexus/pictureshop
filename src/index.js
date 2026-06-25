// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Google Fonts
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap";
document.head.appendChild(link);

// Base styles
const style = document.createElement("style");
style.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<React.StrictMode><App /></React.StrictMode>);
