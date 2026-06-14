'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import EnvironmentSelector from './EnvironmentSelector';

interface TopBarProps {
  activeEnvironmentId: string | null;
  onEnvironmentChange: (id: string | null) => void;
}

export default function TopBar({ activeEnvironmentId, onEnvironmentChange }: TopBarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-3 md:px-4 shrink-0 z-40">
        {/* Left — Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight">
              HTTP<span className="text-blue-500">ilot</span>
            </h1>
          </div>

          {/* Beta badge */}
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-800">
            BETA
          </span>
        </div>

        {/* Center — Environment selector (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-gray-600 text-xs">ENV</span>
          <EnvironmentSelector
            activeEnvironmentId={activeEnvironmentId}
            onEnvironmentChange={onEnvironmentChange}
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* User info — hidden on small screens */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-gray-400 text-xs max-w-35 truncate">{user?.email}</span>
          </div>

          {/* Sign out — hidden on mobile */}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded hover:bg-gray-800"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition"
          >
            {menuOpen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 space-y-3 z-30">
          {/* User */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-gray-300 text-xs truncate">{user?.email}</span>
          </div>

          {/* Environment selector on mobile */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">Environment</span>
            <EnvironmentSelector
              activeEnvironmentId={activeEnvironmentId}
              onEnvironmentChange={onEnvironmentChange}
            />
          </div>

          {/* Sign out */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition py-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </>
  );
}