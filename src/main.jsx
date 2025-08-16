import './index.css';  // <-- Tailwind (must be first)
import './App.css';    // optional extras you already had
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

function ErrorBoundary({ children }) {
  const [err, setErr] = React.useState(null);
  React.useEffect(() => {
    const h = (e) => setErr(e?.error || e?.reason || e);
    window.addEventListener("error", h);
    window.addEventListener("unhandledrejection", h);
    return () => {
      window.removeEventListener("error", h);
      window.removeEventListener("unhandledrejection", h);
    };
  }, []);
  if (err) {
    return (
      <div style={{ padding: 16, color: "#fff", background: "#111827", fontFamily: "ui-sans-serif, system-ui" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>App crashed</div>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.5 }}>
          {String(err?.stack || err?.message || err)}
        </pre>
      </div>
    );
  }
  return children;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
