'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Collection, Request, RequestHistory } from '@/types';

interface SidebarProps {
  onSelectRequest: (request: Request) => void;
}

const methodColor: Record<string, string> = {
  GET: 'text-green-400',
  POST: 'text-yellow-400',
  PUT: 'text-blue-400',
  PATCH: 'text-purple-400',
  DELETE: 'text-red-400',
};

const statusColor = (code: number) => {
  if (code >= 200 && code < 300) return 'text-green-400';
  if (code >= 400) return 'text-red-400';
  return 'text-yellow-400';
};

export default function Sidebar({ onSelectRequest }: SidebarProps) {
  const { getToken } = useAuth();
  const [tab, setTab] = useState<'collections' | 'history'>('collections');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newCollectionName, setNewCollectionName] = useState('');
  const [adding, setAdding] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadCollections = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const data = await apiFetch('/collections', token) as Collection[];
    setCollections(data);
  }, [getToken]);

  const loadHistory = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const data = await apiFetch('/history', token) as RequestHistory[];
    setHistory(data);
  }, [getToken]);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    if (tab === 'history') void loadHistory();
  }, [tab, loadHistory]);

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    const token = await getToken();
    if (!token) return;
    await apiFetch('/collections', token, {
      method: 'POST',
      body: JSON.stringify({ name: newCollectionName }),
    });
    setNewCollectionName('');
    setAdding(false);
    void loadCollections();
  };

  const deleteCollection = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    await apiFetch(`/collections/${id}`, token, { method: 'DELETE' });
    void loadCollections();
  };

  const deleteRequest = async (collectionId: string, requestId: string) => {
    const token = await getToken();
    if (!token) return;
    await apiFetch(`/collections/${collectionId}/requests/${requestId}`, token, { method: 'DELETE' });
    void loadCollections();
  };

  const clearHistory = async () => {
    const token = await getToken();
    if (!token) return;
    await apiFetch('/history', token, { method: 'DELETE' });
    setHistory([]);
  };

  const loadHistoryRequest = (item: RequestHistory) => {
    onSelectRequest({
      id: item.id,
      name: `${item.method} ${item.url}`,
      method: item.method,
      url: item.url,
      headers: item.headers as Record<string, string>,
      body: item.body,
      collectionId: '',
    });
    setMobileOpen(false);
  };

  const handleSelectRequest = (req: Request) => {
    onSelectRequest(req);
    setMobileOpen(false);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-800 shrink-0">
        {(['collections', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs capitalize font-medium transition ${
              tab === t
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Collections Tab */}
      {tab === 'collections' && (
        <>
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-800 shrink-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Collections</span>
            <button
              onClick={() => setAdding(true)}
              className="text-gray-400 hover:text-white text-lg leading-none transition"
            >+</button>
          </div>

          {adding && (
            <div className="px-3 py-2 border-b border-gray-800 flex gap-2 shrink-0">
              <input
                autoFocus
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void createCollection()}
                placeholder="Collection name"
                className="flex-1 bg-gray-800 text-white text-xs rounded px-2 py-1 focus:outline-none border border-gray-700 focus:border-blue-500"
              />
              <button onClick={() => void createCollection()} className="text-blue-400 text-xs hover:text-blue-300">Add</button>
              <button onClick={() => setAdding(false)} className="text-gray-500 text-xs hover:text-white">✕</button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {collections.length === 0 && (
              <p className="text-gray-600 text-xs text-center mt-8 px-4">No collections yet. Create one to save requests.</p>
            )}
            {collections.map((col) => (
              <div key={col.id}>
                <div
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-800 cursor-pointer group"
                  onClick={() => toggleExpand(col.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">{expanded[col.id] ? '▼' : '▶'}</span>
                    <span className="text-gray-300 text-xs font-medium">{col.name}</span>
                    <span className="text-gray-600 text-xs">({col.requests.length})</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); void deleteCollection(col.id); }}
                    className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
                  >✕</button>
                </div>

                {expanded[col.id] && col.requests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className="flex items-center justify-between pl-8 pr-3 py-1.5 hover:bg-gray-800 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`text-xs font-bold w-12 shrink-0 ${methodColor[req.method] ?? 'text-gray-400'}`}>
                        {req.method}
                      </span>
                      <span className="text-gray-400 text-xs truncate">{req.name}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); void deleteRequest(col.id, req.id); }}
                      className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
                    >✕</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <>
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-800 shrink-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">History</span>
            {history.length > 0 && (
              <button
                onClick={() => void clearHistory()}
                className="text-gray-500 hover:text-red-400 text-xs transition"
              >Clear</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {history.length === 0 && (
              <p className="text-gray-600 text-xs text-center mt-8 px-4">No history yet. Send a request to see it here.</p>
            )}
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => loadHistoryRequest(item)}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-800 cursor-pointer border-b border-gray-800/50"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`text-xs font-bold w-12 shrink-0 ${methodColor[item.method] ?? 'text-gray-400'}`}>
                    {item.method}
                  </span>
                  <span className="text-gray-400 text-xs truncate">{item.url}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`text-xs font-medium ${statusColor(item.statusCode)}`}>
                    {item.statusCode}
                  </span>
                  <span className="text-gray-600 text-xs">{formatTime(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-50 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 bg-gray-900 border-r border-gray-800 h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800 shrink-0">
              <span className="text-sm font-bold text-white">HTTP<span className="text-blue-500">ilot</span></span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-gray-900 border-r border-gray-800 flex-col h-full">
        {sidebarContent}
      </div>
    </>
  );
}