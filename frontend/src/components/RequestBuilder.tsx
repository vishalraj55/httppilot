"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { ProxyResponse, Request, Environment } from "@/types";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";

interface Props {
  onResponse: (res: ProxyResponse) => void;
  activeEnvironmentId: string | null;
  activeRequest: Request | null;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const methodColors: Record<string, string> = {
  GET: "#22c55e",
  POST: "#f59e0b",
  PUT: "#3b82f6",
  PATCH: "#a855f7",
  DELETE: "#ef4444",
};

export default function RequestBuilder({
  onResponse,
  activeEnvironmentId,
  activeRequest,
}: Props) {
  const { getToken } = useAuth();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState<
    "headers" | "body" | "auth" | "save"
  >("headers");
  const [authType, setAuthType] = useState<"none" | "bearer" | "basic">("none");
  const [bearerToken, setBearerToken] = useState("");
  const [basicUser, setBasicUser] = useState("");
  const [basicPass, setBasicPass] = useState("");
  const [headers, setHeaders] = useState<
    { key: string; value: string; enabled: boolean }[]
  >([{ key: "", value: "", enabled: true }]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [requestName, setRequestName] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [tabsOpen, setTabsOpen] = useState(true);

  useEffect(() => {
    if (activeRequest) {
      setMethod(activeRequest.method);
      setUrl(activeRequest.url);
      const h = activeRequest.headers as Record<string, string>;
      setHeaders([
        ...Object.entries(h).map(([key, value]) => ({
          key,
          value,
          enabled: true,
        })),
        { key: "", value: "", enabled: true },
      ]);
      setBody(
        activeRequest.body ? JSON.stringify(activeRequest.body, null, 2) : "",
      );
      setRequestName(activeRequest.name);
    }
  }, [activeRequest]);

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      if (!token) return;
      const data = (await apiFetch("/collections", token)) as any[];
      setCollections(data);
      if (data.length > 0) setSelectedCollection(data[0].id as string);
    };
    void load();
  }, [getToken]);

  const getEnvironmentVariables = async (): Promise<Record<string, string>> => {
    if (!activeEnvironmentId) return {};
    const token = await getToken();
    if (!token) return {};
    const envs = (await apiFetch("/environments", token)) as Environment[];
    const env = envs.find((e) => e.id === activeEnvironmentId);
    return env?.variables ?? {};
  };

  const sendRequest = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const headersObj: Record<string, string> = {};
      headers.forEach(({ key, value, enabled }) => {
        if (key.trim() && enabled) headersObj[key.trim()] = value.trim();
      });

      if (authType === "bearer" && bearerToken) {
        headersObj["Authorization"] = `Bearer ${bearerToken}`;
      } else if (authType === "basic" && basicUser) {
        headersObj["Authorization"] =
          `Basic ${btoa(`${basicUser}:${basicPass}`)}`;
      }

      const environmentVariables = await getEnvironmentVariables();

      let parsedBody = undefined;
      if (body.trim() && method !== "GET") {
        try {
          parsedBody = JSON.parse(body) as any;
        } catch {
          parsedBody = body;
        }
      }

      const res = (await apiFetch("/proxy", token, {
        method: "POST",
        body: JSON.stringify({
          method,
          url,
          headers: headersObj,
          requestBody: parsedBody,
          environmentVariables,
        }),
      })) as ProxyResponse;

      onResponse(res);
    } finally {
      setLoading(false);
    }
  };

  const saveRequest = async () => {
    if (!requestName.trim() || !selectedCollection) return;
    const token = await getToken();
    if (!token) return;

    const headersObj: Record<string, string> = {};
    headers.forEach(({ key, value, enabled }) => {
      if (key.trim() && enabled) headersObj[key.trim()] = value.trim();
    });

    await apiFetch(`/collections/${selectedCollection}/requests`, token, {
      method: "POST",
      body: JSON.stringify({
        name: requestName,
        method,
        url,
        headers: headersObj,
        body: body ? JSON.parse(body) : null,
      }),
    });

    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const updateHeader = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updated = [...headers];
    updated[index][field] = value;
    if (index === headers.length - 1 && value) {
      updated.push({ key: "", value: "", enabled: true });
    }
    setHeaders(updated);
  };

  const toggleHeader = (index: number) => {
    const updated = [...headers];
    updated[index].enabled = !updated[index].enabled;
    setHeaders(updated);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const activeHeaderCount = headers.filter(
    (h) => h.key.trim() && h.enabled,
  ).length;

  return (
    <div
      className="flex flex-col shrink-0"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* URL Bar */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-3 py-2.5"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-panel)",
        }}
      >
        {/* Method + URL row */}
        <div className="flex items-center gap-2 flex-1">
          {/* Method */}
          <div className="relative shrink-0">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="appearance-none pl-2 pr-7 py-2 rounded text-xs font-bold font-mono focus:outline-none cursor-pointer"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: methodColors[method],
                minWidth: "72px",
              }}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            >
              <svg
                className="w-2.5 h-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* URL */}
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void sendRequest()}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 min-w-0 px-3 py-2 rounded text-xs font-mono focus:outline-none transition"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Send button */}
        <button
          onClick={() => void sendRequest()}
          disabled={loading || !url}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded text-xs font-semibold text-white transition disabled:opacity-40 shrink-0"
          style={{
            background: "var(--accent)",
            boxShadow:
              !loading && url ? "0 0 16px rgba(0,112,243,0.3)" : "none",
          }}
        >
          {loading ? (
            <>
              <svg
                className="w-3 h-3 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Sending</span>
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span>Send</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs header */}
      <div
        className="flex items-center justify-between px-3"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-panel)",
        }}
      >
        <div className="flex items-center overflow-x-auto">
          {(["headers", "body", "auth", "save"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setTabsOpen(true);
              }}
              className="relative px-3 py-2 text-xs font-medium capitalize transition whitespace-nowrap shrink-0"
              style={{
                color:
                  activeTab === tab
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
              }}
            >
              {tab}
              {tab === "headers" && activeHeaderCount > 0 && (
                <span
                  className="ml-1 px-1 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    background: "rgba(0,112,243,0.15)",
                    color: "var(--accent)",
                  }}
                >
                  {activeHeaderCount}
                </span>
              )}
              {tab === "auth" && authType !== "none" && (
                <span
                  className="ml-1 w-1.5 h-1.5 rounded-full inline-block align-middle"
                  style={{ background: "#22c55e" }}
                />
              )}
              {activeTab === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Collapse toggle on mobile */}
        <button
          onClick={() => setTabsOpen(!tabsOpen)}
          className="sm:hidden p-1 rounded transition"
          style={{ color: "var(--text-muted)" }}
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
              d={tabsOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        </button>
      </div>

      {/* Tab Content */}
      {tabsOpen && (
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "180px", background: "var(--bg-base)" }}
        >
          {/* Headers */}
          {activeTab === "headers" && (
            <div className="p-3 space-y-1.5">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={() => toggleHeader(i)}
                    className="w-3 h-3 shrink-0 cursor-pointer"
                    style={{
                      accentColor: "var(--accent)",
                      opacity: h.key ? 1 : 0,
                    }}
                  />
                  <input
                    value={h.key}
                    onChange={(e) => updateHeader(i, "key", e.target.value)}
                    placeholder="Header name"
                    className="flex-1 min-w-0 px-2 py-1.5 rounded text-xs font-mono focus:outline-none transition"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: h.enabled
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                      opacity: h.enabled ? 1 : 0.5,
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--accent)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                  <input
                    value={h.value}
                    onChange={(e) => updateHeader(i, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1 min-w-0 px-2 py-1.5 rounded text-xs focus:outline-none transition"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: h.enabled
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                      opacity: h.enabled ? 1 : 0.5,
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--accent)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                  <button
                    onClick={() => removeHeader(i)}
                    className="opacity-0 group-hover:opacity-100 transition shrink-0"
                    style={{
                      color: "var(--text-muted)",
                      display: h.key ? "block" : "none",
                    }}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          {activeTab === "body" && (
            <CodeMirror
              value={body}
              height="160px"
              extensions={[json()]}
              theme={oneDark}
              onChange={(val) => setBody(val)}
              className="text-xs"
            />
          )}

          {/* Auth */}
          {activeTab === "auth" && (
            <div className="p-3 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(["none", "bearer", "basic"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAuthType(type)}
                    className="px-3 py-1.5 rounded text-xs font-medium transition"
                    style={{
                      background:
                        authType === type
                          ? "var(--accent)"
                          : "var(--bg-elevated)",
                      color:
                        authType === type ? "#fff" : "var(--text-secondary)",
                      border: `1px solid ${authType === type ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    {type === "none"
                      ? "No Auth"
                      : type === "bearer"
                        ? "Bearer Token"
                        : "Basic Auth"}
                  </button>
                ))}
              </div>

              {authType === "none" && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  No authentication header will be sent with this request.
                </p>
              )}

              {authType === "bearer" && (
                <div className="space-y-1.5">
                  <label
                    className="text-[10px] uppercase tracking-wider font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Token
                  </label>
                  <input
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 rounded text-xs font-mono focus:outline-none transition"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--accent)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                  <p
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Adds{" "}
                    <code style={{ color: "var(--accent)" }}>
                      Authorization: Bearer &lt;token&gt;
                    </code>{" "}
                    header
                  </p>
                </div>
              )}

              {authType === "basic" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] uppercase tracking-wider font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Username
                    </label>
                    <input
                      value={basicUser}
                      onChange={(e) => setBasicUser(e.target.value)}
                      placeholder="username"
                      className="w-full px-3 py-2 rounded text-xs focus:outline-none transition"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--accent)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--border)")
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] uppercase tracking-wider font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      value={basicPass}
                      onChange={(e) => setBasicPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded text-xs focus:outline-none transition"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--accent)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--border)")
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save */}
          {activeTab === "save" && (
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label
                    className="text-[10px] uppercase tracking-wider font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Request Name
                  </label>
                  <input
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="Get all users"
                    className="w-full px-3 py-2 rounded text-xs focus:outline-none transition"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--accent)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="text-[10px] uppercase tracking-wider font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Collection
                  </label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full px-3 py-2 rounded text-xs focus:outline-none"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: collections.length
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {collections.length === 0 && (
                      <option value="">No collections yet</option>
                    )}
                    {collections.map((c: any) => (
                      <option key={c.id as string} value={c.id as string}>
                        {c.name as string}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => void saveRequest()}
                disabled={
                  !requestName.trim() ||
                  !selectedCollection ||
                  collections.length === 0
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold transition disabled:opacity-40"
                style={{
                  background: savedFlash ? "#22c55e" : "var(--accent)",
                  color: "#fff",
                }}
              >
                {savedFlash ? (
                  <>✓ Saved to collection</>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Save to Collection
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
