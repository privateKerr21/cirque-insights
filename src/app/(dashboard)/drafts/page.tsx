"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, FileText, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, PLATFORM_COLORS, PLATFORMS, DRAFT_STATUSES } from "@/lib/constants";
import type { Draft, Platform, DraftStatus } from "@/lib/types";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState<Platform | "">("");
  const [filterStatus, setFilterStatus] = useState<DraftStatus | "">("");

  const fetchDrafts = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterPlatform) params.set("platform", filterPlatform);
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/drafts?${params}`);
    const data = await res.json();
    if (Array.isArray(data)) setDrafts(data);
    setLoading(false);
  }, [filterPlatform, filterStatus]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft?")) return;
    await fetch(`/api/drafts?id=${id}`, { method: "DELETE" });
    fetchDrafts();
  }

  async function handleCreate() {
    const res = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled Draft",
        platform: "instagram",
        content_type: "post",
      }),
    });
    const draft = await res.json();
    if (draft.id) window.location.href = `/drafts/${draft.id}`;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Drafts</h1>
          <p className="text-slate-500 mt-1">Manage your content drafts</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Draft
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value as Platform | "")}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="">All Platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as DraftStatus | "")}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          {DRAFT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Draft List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : drafts.length > 0 ? (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:border-indigo-200 transition-colors"
            >
              <Link href={`/drafts/${draft.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-slate-900 truncate">
                    {draft.title}
                  </h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      STATUS_COLORS[draft.status]
                    )}
                  >
                    {draft.status}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      PLATFORM_COLORS[draft.platform]
                    )}
                  >
                    {draft.platform}
                  </span>
                </div>
                <p className="text-sm text-slate-500 truncate">
                  {draft.caption || "No caption yet"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Updated {format(new Date(draft.updated_at), "MMM d, yyyy")}
                </p>
              </Link>
              <button
                onClick={() => handleDelete(draft.id)}
                className="ml-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <FileText className="w-12 h-12 mb-3" />
          <p>No drafts yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
