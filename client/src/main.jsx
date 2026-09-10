import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppRouter from "./router";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#16161F",
          color: "#E8E8F0",
          border: "1px solid #2A2A3A",
          borderRadius: "12px",
          fontSize: "13px",
          padding: "12px 16px",
        },
        success: { iconTheme: { primary: "#34D399", secondary: "#16161F" } },
        error:   { iconTheme: { primary: "#F87171", secondary: "#16161F" } },
      }}
    />
    <AppRouter />
  </React.StrictMode>
);