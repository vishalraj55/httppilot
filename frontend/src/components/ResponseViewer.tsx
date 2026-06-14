'use client';
import { useState } from 'react';
import { ProxyResponse } from '@/types';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

interface Props {
  response: ProxyResponse | null;
}

const getStatusStyle = (code: number) => {
  if (code >= 200 && code < 300) return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' };
  if (code >= 300 && code < 400) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' };
  if (code >= 400) return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' };
  return { color: '#888', bg: 'rgba(136,136,136,0.1)', border: 'rgba(136,136,136,0.2)' };
};

export default function ResponseViewer({ response }: Props) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  const [copied, setCopied] = useState(false);

  const copyResponse = async () => {
    if (!response?.data) return;
    await navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--bg-base)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Ready to send</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Enter a URL and press Send</p>
        </div>
      </div>
    );
  }

  if (response.error) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center p-6 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>Network Error</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{response.error}</p>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(response.statusCode);
  const bodyString = typeof response.data === 'string'
    ? response.data
    : JSON.stringify(response.data, null, 2);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-xs font-bold"
            style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
            {response.statusCode} {response.statusText}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {response.timeTaken}ms
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {(response.size / 1024).toFixed(2)} KB
          </span>
        </div>

        <button
          onClick={() => void copyResponse()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition"
          style={{
            color: copied ? '#22c55e' : 'var(--text-secondary)',
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
          }}
        >
          {copied ? (
            <>✓ Copied</>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        {(['body', 'headers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-3 py-2 text-xs font-medium capitalize transition"
            style={{ color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {tab}
            {tab === 'headers' && (
              <span className="ml-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                ({Object.keys(response.headers).length})
              </span>
            )}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--accent)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'body' && (
          <CodeMirror
            value={bodyString}
            height="100%"
            extensions={[json()]}
            theme={oneDark}
            editable={false}
            className="text-xs h-full"
          />
        )}

        {activeTab === 'headers' && (
          <div className="p-3 space-y-0.5">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 py-1.5 text-xs"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="w-48 shrink-0 font-mono" style={{ color: 'var(--accent)' }}>{key}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{value as string}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}