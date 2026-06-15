'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Collection, Request, RequestHistory } from '@/types';

interface SidebarProps {
  onSelectRequest: (request: Request) => void;
}

const methodColors: Record<string, string> = {
  GET: '#0070f3',
  POST: '#f5a623',
  PUT: '#7928ca',
  PATCH: '#50e3c2',
  DELETE: '#ee0000',
};

const statusColor = (code: number) => {
  if (code >= 200 && code < 300) return '#0070f3';
  if (code >= 400) return '#ee0000';
  return '#f5a623';
};

const styles = {
  sidebar: {
    background: '#111111',
    borderRight: '1px solid #1f1f1f',
    fontFamily: 'Geist, Inter, system-ui, -apple-system, sans-serif',
  },
  tab: (active: boolean) => ({
    color: active ? '#ededed' : '#555555',
    fontSize: '12px',
    fontWeight: active ? 500 : 400,
    letterSpacing: '-0.28px',
    background: 'transparent',
    borderBottom: active ? '1px solid #ededed' : '1px solid transparent',
    transition: 'all 0.15s',
  }),
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: '#444444',
    fontFamily: 'Geist Mono, ui-monospace, monospace',
    textTransform: 'uppercase' as const,
  },
  collectionRow: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#ededed',
    letterSpacing: '-0.28px',
  },
  requestRow: {
    fontSize: '12px',
    color: '#888888',
    letterSpacing: '-0.28px',
  },
  input: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#ededed',
    padding: '0 10px',
    height: '32px',
    outline: 'none',
    width: '100%',
    fontFamily: 'Geist, Inter, system-ui, sans-serif',
  },
  addBtn: {
    background: '#ededed',
    color: '#111111',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    padding: '0 10px',
    height: '32px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  emptyState: {
    background: '#161616',
    border: '1px dashed #2a2a2a',
    borderRadius: '8px',
  },
  historyRow: {
    borderBottom: '1px solid #1a1a1a',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    const load = async () => { await loadCollections(); };
    void load();
  }, [loadCollections]);

  useEffect(() => {
    if (tab !== 'history') return;
    const load = async () => { await loadHistory(); };
    void load();
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

  const handleHistoryClick = (item: RequestHistory) => {
    onSelectRequest({
      id: item.id,
      name: `${item.method} ${item.url}`,
      method: item.method,
      url: item.url,
      headers: {},
      body: undefined,
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
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Tab switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1f1f1f', flexShrink: 0 }}>
        {(['collections', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
              ...styles.tab(tab === t),
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Collections */}
      {tab === 'collections' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', borderBottom: '1px solid #1f1f1f', flexShrink: 0,
          }}>
            <span style={styles.sectionLabel}>Collections</span>
            <button
              onClick={() => setAdding(!adding)}
              style={{
                width: '20px', height: '20px', borderRadius: '6px',
                border: '1px solid #2a2a2a', background: adding ? '#ededed' : '#1a1a1a',
                color: adding ? '#111111' : '#ededed',
                cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}
            >+</button>
          </div>

          {/* New collection input */}
          {adding && (
            <div style={{
              display: 'flex', gap: '6px', padding: '8px 12px',
              borderBottom: '1px solid #1f1f1f', background: '#161616', flexShrink: 0,
            }}>
              <input
                autoFocus
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void createCollection();
                  if (e.key === 'Escape') setAdding(false);
                }}
                placeholder="Collection name"
                style={styles.input}
                onFocus={e => (e.target.style.borderColor = '#0070f3')}
                onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
              />
              <button onClick={() => void createCollection()} style={styles.addBtn}>Add</button>
            </div>
          )}

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {collections.length === 0 ? (
              <div style={{ padding: '24px 12px' }}>
                <div style={{ ...styles.emptyState, padding: '20px', textAlign: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 10px',
                  }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#444">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px', fontWeight: 500 }}>
                    No collections
                  </p>
                  <p style={{ fontSize: '12px', color: '#444', margin: '0 0 12px' }}>
                    Save requests to organize your work
                  </p>
                  <button
                    onClick={() => setAdding(true)}
                    style={{
                      fontSize: '12px', fontWeight: 500, color: '#ededed',
                      background: '#1a1a1a', border: '1px solid #2a2a2a',
                      borderRadius: '100px', padding: '4px 12px', cursor: 'pointer',
                    }}
                  >Create collection</button>
                </div>
              </div>
            ) : (
              collections.map((col) => (
                <div key={col.id}>
                  {/* Collection row */}
                  <div
                    className="group"
                    onClick={() => toggleExpand(col.id)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1a1a1a')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 12px', cursor: 'pointer',
                      borderBottom: '1px solid #1f1f1f', transition: 'background 0.1s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <svg
                        width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#444"
                        style={{
                          flexShrink: 0, transition: 'transform 0.15s',
                          transform: expanded[col.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#0070f3" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span style={{ ...styles.collectionRow, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#444', flexShrink: 0 }}>
                        {col.requests.length}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); void deleteCollection(col.id); }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ee0000')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#333')}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#333', padding: '2px', opacity: 0,
                        transition: 'color 0.1s',
                        display: 'flex', alignItems: 'center',
                      }}
                      className="group-hover:opacity-100"
                      onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                      onMouseOut={e => (e.currentTarget.style.opacity = '0')}
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Requests */}
                  {expanded[col.id] && col.requests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => handleSelectRequest(req)}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.background = '#1a1a1a';
                        setHoveredId(req.id);
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                        setHoveredId(null);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingLeft: '28px', paddingRight: '12px', paddingTop: '5px', paddingBottom: '5px',
                        cursor: 'pointer', borderBottom: '1px solid #161616', transition: 'background 0.1s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, fontFamily: 'Geist Mono, monospace',
                          color: methodColors[req.method] ?? '#444',
                          background: `${methodColors[req.method]}20`,
                          padding: '1px 5px', borderRadius: '4px', flexShrink: 0,
                        }}>
                          {req.method}
                        </span>
                        <span style={{ ...styles.requestRow, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); void deleteRequest(col.id, req.id); }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#333', padding: '2px', flexShrink: 0,
                          opacity: hoveredId === req.id ? 1 : 0, transition: 'opacity 0.1s',
                          display: 'flex', alignItems: 'center',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ee0000')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#333')}
                      >
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', borderBottom: '1px solid #1f1f1f', flexShrink: 0,
          }}>
            <span style={styles.sectionLabel}>Recent — {history.length}</span>
            {history.length > 0 && (
              <button
                onClick={() => void clearHistory()}
                onMouseEnter={e => (e.currentTarget.style.color = '#ee0000')}
                onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '11px', color: '#444', fontFamily: 'Geist, Inter, sans-serif',
                  transition: 'color 0.1s', padding: 0,
                }}
              >Clear</button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {history.length === 0 ? (
              <div style={{ padding: '24px 12px' }}>
                <div style={{ ...styles.emptyState, padding: '20px', textAlign: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 10px',
                  }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#444">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px', fontWeight: 500 }}>
                    No history yet
                  </p>
                  <p style={{ fontSize: '12px', color: '#444', margin: 0 }}>
                    Sent requests will appear here
                  </p>
                </div>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1a1a1a')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  style={{ ...styles.historyRow, display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px' }}
                >
                  <span style={{
                    fontSize: '10px', fontWeight: 600, fontFamily: 'Geist Mono, monospace',
                    color: methodColors[item.method] ?? '#444',
                    background: `${methodColors[item.method]}20`,
                    padding: '1px 5px', borderRadius: '4px', flexShrink: 0,
                  }}>
                    {item.method}
                  </span>

                  <span style={{
                    flex: 1, fontSize: '12px', color: '#888',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '-0.28px',
                  }}>
                    {item.url.replace(/^https?:\/\//, '')}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: '1px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: statusColor(item.statusCode) }}>
                      {item.statusCode}
                    </span>
                    <span style={{ fontSize: '10px', color: '#444', fontFamily: 'Geist Mono, monospace' }}>
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile FAB */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex"
        style={{
          position: 'fixed', bottom: '20px', left: '20px', zIndex: 50,
          width: '44px', height: '44px', borderRadius: '100px',
          background: '#0070f3', color: '#ffffff', border: 'none', 
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0px 4px 16px rgba(0,112,243,0.4)',
        }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{
            position: 'relative', width: '280px', height: '100%', display: 'flex', flexDirection: 'column',
            ...styles.sidebar,
            boxShadow: '0px 8px 32px rgba(0,0,0,0.4)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid #1f1f1f',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ededed', letterSpacing: '-0.28px' }}>
                HTTP<span style={{ color: '#0070f3' }}>ilot</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', display: 'flex' }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>{sidebarContent}</div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ width: '220px', flexShrink: 0, height: '100vh', flexDirection: 'column', position: 'sticky', top: 0, ...styles.sidebar }}>
        {sidebarContent}
      </div>
    </>
  );
}