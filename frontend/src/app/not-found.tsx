export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0a", fontFamily: "Geist, Inter, system-ui, -apple-system, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: "360px", padding: "0 24px" }}>

        {/* logo */}
        <div style={{ fontSize: "18px", fontWeight: 600, color: "#var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "32px" }}>
          HTTP<span style={{ color: "#0070f3" }}>ilot</span>
        </div>

        {/* 404 badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: "100px", border: "1px solid var(--border)", background: "#111", marginBottom: "20px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ee0000", display: "inline-block" }} />
          <span style={{ fontSize: "11px", fontWeight: 500, color: "#555", fontFamily: "Geist Mono, ui-monospace, monospace", letterSpacing: "0.06em" }}>404 NOT_FOUND</span>
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#var(--text-primary)", letterSpacing: "-0.5px", margin: "0 0 8px" }}>
          Route not found
        </h1>

        <p style={{ fontSize: "13px", color: "#555", margin: "0 0 28px", letterSpacing: "-0.28px", lineHeight: "1.6" }}>
          This page doesn&apos;t exist. Head back to the dashboard to continue building.
        </p>

        <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#0070f3", color: "#ffffff", borderRadius: "6px", fontSize: "13px", fontWeight: 500, textDecoration: "none", letterSpacing: "-0.28px" }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to dashboard
        </a>

      </div>
    </div>
  );
}