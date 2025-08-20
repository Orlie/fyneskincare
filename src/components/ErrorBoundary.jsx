import React from "react";

export default function ErrorBoundary({ children }) {
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