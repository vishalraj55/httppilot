'use client';
import { useState } from 'react';
import { ProxyResponse } from '@/types';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

interface Props {
  response: ProxyResponse | null;
}

const statusColor = (code: number) => {
  if (code >= 200 && code < 300) return 'text-green-400';
  if (code >= 300 && code < 400) return 'text-yellow-400';
  if (code >= 400 && code < 500) return 'text-red-400';
  if (code >= 500) return 'text-red-600';
  return 'text-gray-400';
};

export default function ResponseViewer({ response }: Props) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Send a request to see the response
      </div>
    );
  }

  if (response.error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm font-medium">Network Error</p>
          <p className="text-gray-500 text-xs mt-1">{response.error}</p>
        </div>
      </div>
    );
  }

  const bodyString = typeof response.data === 'string'
    ? response.data
    : JSON.stringify(response.data, null, 2);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800 bg-gray-900">
        <span className={`text-xs font-bold ${statusColor(response.statusCode)}`}>
          {response.statusCode} {response.statusText}
        </span>
        <span className="text-gray-500 text-xs">{response.timeTaken}ms</span>
        <span className="text-gray-500 text-xs">
          {(response.size / 1024).toFixed(2)} KB
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(['body', 'headers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs capitalize transition ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
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
          <div className="p-4 space-y-1">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 text-xs">
                <span className="text-blue-400 font-medium w-48 shrink-0">{key}</span>
                <span className="text-gray-300">{value as string}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}