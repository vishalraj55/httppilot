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

const methodColor: Record<string, string> = {
  GET: "text-green-400",
  POST: "text-yellow-400",
  PUT: "text-blue-400",
  PATCH: "text-purple-400",
  DELETE: "text-red-400",
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
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  // Save to collection state
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [requestName, setRequestName] = useState("");

  // Load active request into builder
  useEffect(() => {
    if (activeRequest) {
      setMethod(activeRequest.method);
      setUrl(activeRequest.url);
      const h = activeRequest.headers as Record<string, string>;
      setHeaders(Object.entries(h).map(([key, value]) => ({ key, value })));
      setBody(
        activeRequest.body ? JSON.stringify(activeRequest.body, null, 2) : "",
      );
      setRequestName(activeRequest.name);
    }
  }, [activeRequest]);

  // Load collections for save tab
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
      headers.forEach(({ key, value }) => {
        if (key.trim()) headersObj[key.trim()] = value.trim();
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
    headers.forEach(({ key, value }) => {
      if (key.trim()) headersObj[key.trim()] = value.trim();
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

    setActiveTab("headers");
  };

  const updateHeader = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updated = [...headers];
    updated[index][field] = value;
    if (index === headers.length - 1 && value) {
      updated.push({ key: "", value: "" });
    }
    setHeaders(updated);
  };

  return (
    <div className="border-b border-gray-800 flex flex-col">
      {/* URL Bar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-800">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className={`bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm font-bold focus:outline-none ${methodColor[method]}`}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void sendRequest()}
          placeholder="Enter URL or paste {{base_url}}/endpoint"
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={() => void sendRequest()}
          disabled={loading || !url}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(["headers", "body", "auth", "save"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs capitalize transition ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-3 max-h-48 overflow-y-auto">
        {activeTab === "headers" && (
          <div className="space-y-1">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={h.key}
                  onChange={(e) => updateHeader(i, "key", e.target.value)}
                  placeholder="Key"
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                />
                <input
                  value={h.value}
                  onChange={(e) => updateHeader(i, "value", e.target.value)}
                  placeholder="Value"
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "body" && (
          <CodeMirror
            value={body}
            height="150px"
            extensions={[json()]}
            theme={oneDark}
            onChange={(val) => setBody(val)}
            className="text-xs rounded border border-gray-700"
          />
        )}

        {activeTab === "auth" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["none", "bearer", "basic"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setAuthType(type)}
                  className={`px-3 py-1 rounded text-xs transition border ${
                    authType === type
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {type === "none" ? "No Auth" : type === "bearer" ? "Bearer Token" : "Basic Auth"}
                </button>
              ))}
            </div>

            {authType === "bearer" && (
              <div>
                <label className="text-gray-500 text-xs mb-1 block">Token</label>
                <input
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="Enter bearer token"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-gray-600 text-xs mt-1">Adds <code className="text-blue-400">Authorization: Bearer &lt;token&gt;</code> header</p>
              </div>
            )}

            {authType === "basic" && (
              <div className="space-y-2">
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Username</label>
                  <input
                    value={basicUser}
                    onChange={(e) => setBasicUser(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Password</label>
                  <input
                    type="password"
                    value={basicPass}
                    onChange={(e) => setBasicPass(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-gray-600 text-xs">Adds <code className="text-blue-400">Authorization: Basic &lt;base64&gt;</code> header</p>
              </div>
            )}

            {authType === "none" && (
              <p className="text-gray-600 text-xs">No authentication will be added to this request.</p>
            )}
          </div>
        )}

        {activeTab === "save" && (
          <div className="space-y-2">
            <input
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              placeholder="Request name"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            />
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none"
            >
              {collections.map((c: any) => (
                <option key={c.id as string} value={c.id as string}>
                  {c.name as string}
                </option>
              ))}
            </select>
            <button
              onClick={() => void saveRequest()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition"
            >
              Save Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
