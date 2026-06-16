"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import EnvironmentSelector from "./EnvironmentSelector";
import { useTheme } from "@/context/ThemeContext";

interface TopBarProps {
  activeEnvironmentId: string | null;
  onEnvironmentChange: (id: string | null) => void;
}

export default function TopBar({
  activeEnvironmentId,
  onEnvironmentChange,
}: TopBarProps) {
  const { user, logout } = useAuth();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const emailInitial = user?.email?.[0]?.toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        style={{
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--border)",
        }}
        className="h-11 flex items-center justify-between px-3 shrink-0 z-40"
      >
        {/* Left — Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              HTTP<span style={{ color: "var(--accent)" }}>Pilot</span>
            </span>
          </div>
          <span
            className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              background: "rgba(0,112,243,0.1)",
              color: "var(--accent)",
              border: "1px solid rgba(0,112,243,0.2)",
            }}
          >
            BETA
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              ENV
            </span>
            <EnvironmentSelector
              activeEnvironmentId={activeEnvironmentId}
              onEnvironmentChange={onEnvironmentChange}
            />
          </div>

          {/* Right */}

          {/* Avatar with dropdown — desktop */}
          <div className="relative hidden sm:block" ref={menuRef}>
            <button
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white transition"
              style={{
                background: "var(--accent)",
                outline: avatarMenuOpen
                  ? "2px solid rgba(0,112,243,0.4)"
                  : "none",
              }}
            >
              {emailInitial}
            </button>

            {avatarMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  minWidth: "200px",
                  zIndex: 100,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                }}
              >
                {/* Account info */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: "var(--accent)" }}
                    >
                      {emailInitial}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#var(--text-primary)",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user?.email}
                      </p>
                      <p style={{ fontSize: "10px", color: "#555", margin: 0 }}>
                        Signed in
                      </p>
                    </div>
                  </div>
                </div>

{/* Theme toggle */}
<button
  onClick={toggleTheme}
  className="w-full flex items-center gap-2 text-xs transition"
  style={{
    padding: '10px 14px',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    textAlign: 'left',
  }}
  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
>
  {theme === 'dark' ? (
    <>
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      Switch to light mode
    </>
  ) : (
    <>
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
      Switch to dark mode
    </>
  )}
</button>
                {/* Sign out */}
                <button
                  onClick={() => {
                    setAvatarMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 text-xs transition"
                  style={{
                    padding: "10px 14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ee0000")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-secondary)")
                  }
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded transition"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden px-4 py-3 space-y-3 z-30"
          style={{
            background: "var(--bg-panel)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            className="flex items-center gap-2 pb-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              {emailInitial}
            </div>
            <span
              className="text-xs truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {user?.email}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Environment
            </span>
            <EnvironmentSelector
              activeEnvironmentId={activeEnvironmentId}
              onEnvironmentChange={onEnvironmentChange}
            />
          </div>
          {/* Theme toggle in mobile menu */}
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            <button
              onClick={toggleTheme}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                transition: "background 0.15s",
              }}
            >
              {theme === "dark" ? (
                <>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    />
                  </svg>
                  Light
                </>
              ) : (
                <>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    />
                  </svg>
                  Dark
                </>
              )}
            </button>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs py-1"
            style={{ color: "var(--error)" }}
          >
            Sign out
          </button>
        </div>
      )}
    </>
  );
}