"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  Webhook,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { SyncLog } from "@/lib/types";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const res = await fetch("/api/settings/make");
    const data = await res.json();
    setHasApiKey(data.hasApiKey);
    setApiKey(data.apiKey);
    setSyncLogs(data.syncLogs ?? []);
    setLoading(false);
  }

  async function generateKey() {
    setGenerating(true);
    const res = await fetch("/api/settings/make", { method: "POST" });
    const data = await res.json();
    if (data.apiKey) {
      setApiKey(data.apiKey);
      setHasApiKey(true);
    }
    setGenerating(false);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/make`
      : "/api/webhooks/make";

  const lastSync = syncLogs[0] ?? null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Integrations Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Webhook className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">
            Make Integration
          </h2>
        </div>
        <p className="text-sm text-slate-400 -mt-4">
          Connect a Make (Integromat) scenario to automatically sync your social
          media metrics.
        </p>

        {/* Webhook URL */}
        <div className="bg-white/5 rounded-xl p-5 space-y-3">
          <label className="text-sm font-medium text-slate-300">
            Webhook URL
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={webhookUrl}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
            />
            <button
              onClick={() => copyToClipboard(webhookUrl, "url")}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              {copied === "url" ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Use this URL in your Make HTTP module as the request URL.
          </p>
        </div>

        {/* API Key */}
        <div className="bg-white/5 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">
              API Key
            </label>
          </div>

          {apiKey ? (
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={apiKey}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
              <button
                onClick={() => copyToClipboard(apiKey, "key")}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                {copied === "key" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ) : hasApiKey ? (
            <p className="text-sm text-slate-400">
              An API key has been generated. Regenerate to see it again.
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              No API key generated yet. Generate one to get started.
            </p>
          )}

          <button
            onClick={generateKey}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${generating ? "animate-spin" : ""}`}
            />
            {hasApiKey ? "Regenerate Key" : "Generate Key"}
          </button>

          {hasApiKey && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">
                Regenerating will invalidate the previous key. Update your Make
                scenario with the new key.
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Add this key as an <code className="text-slate-400">x-api-key</code>{" "}
            header in your Make HTTP request.
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white/5 rounded-xl p-5 space-y-3">
          <label className="text-sm font-medium text-slate-300">
            Connection Status
          </label>
          {lastSync ? (
            <div className="flex items-center gap-3">
              {lastSync.status === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <div>
                <p className="text-sm text-white">
                  Last sync:{" "}
                  <span
                    className={
                      lastSync.status === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {lastSync.status}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(lastSync.created_at).toLocaleString()} &middot;{" "}
                  {lastSync.records_synced} record(s) &middot;{" "}
                  {lastSync.platform}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No syncs yet. Configure your Make scenario and send a test
              request.
            </p>
          )}
        </div>

        {/* Sync History */}
        {syncLogs.length > 0 && (
          <div className="bg-white/5 rounded-xl p-5 space-y-3">
            <label className="text-sm font-medium text-slate-300">
              Sync History
            </label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-4">Time</th>
                    <th className="pb-2 pr-4">Platform</th>
                    <th className="pb-2 pr-4">Records</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Error</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {syncLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-2 pr-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4 capitalize">{log.platform}</td>
                      <td className="py-2 pr-4">{log.records_synced}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.status === "success"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-red-400 truncate max-w-[200px]">
                        {log.error_message ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
