"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import RequestBuilder from "@/components/RequestBuilder";
import ResponseViewer from "@/components/ResponseViewer";
import { ProxyResponse, Request } from "@/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [response, setResponse] = useState<ProxyResponse | null>(null);
  const [activeEnvironmentId, setActiveEnvironmentId] = useState<string | null>(
    null,
  );
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="h-screen flex flex-col"
      style={{ background: "#0a0a0a", color: "#ededed" }}
    >
      <TopBar
        activeEnvironmentId={activeEnvironmentId}
        onEnvironmentChange={setActiveEnvironmentId}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSelectRequest={setActiveRequest} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <RequestBuilder
            key={activeRequest?.id ?? "new"}
            onResponse={setResponse}
            activeEnvironmentId={activeEnvironmentId}
            activeRequest={activeRequest}
          />
          <ResponseViewer response={response} />
        </main>
      </div>
    </div>
  );
}
