"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Save,
  Hash,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, PLATFORMS, CONTENT_TYPES, DRAFT_STATUSES } from "@/lib/constants";
import type { Draft, Platform, ContentType, DraftStatus } from "@/lib/types";

export default function DraftEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [generatingHashtags, setGeneratingHashtags] = useState(false);
  const [newHashtag, setNewHashtag] = useState("");

  const fetchDraft = useCallback(async () => {
    const res = await fetch("/api/drafts");
    const data = await res.json();
    if (Array.isArray(data)) {
      const found = data.find((d: Draft) => d.id === id);
      if (found) setDraft(found);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDraft();
  }, [fetchDraft]);

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    await fetch("/api/drafts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: draft.id,
        title: draft.title,
        caption: draft.caption,
        hashtags: draft.hashtags,
        platform: draft.platform,
        content_type: draft.content_type,
        status: draft.status,
        notes: draft.notes,
      }),
    });
    setSaving(false);
  }

  async function handleGenerateCaption() {
    if (!draft) return;
    setGeneratingCaption(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "caption",
          topic: draft.title || draft.notes || "brand post",
          platform: draft.platform,
          contentType: draft.content_type,
        }),
      });
      const data = await res.json();
      if (data.content) {
        setDraft({ ...draft, caption: data.content });
      }
    } catch {}
    setGeneratingCaption(false);
  }

  async function handleGenerateHashtags() {
    if (!draft) return;
    setGeneratingHashtags(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hashtags",
          topic: draft.title || draft.caption || "brand post",
          platform: draft.platform,
        }),
      });
      const data = await res.json();
      if (data.content) {
        const tags = data.content
          .split(/\s+/)
          .filter((t: string) => t.startsWith("#"));
        setDraft({ ...draft, hashtags: tags });
      }
    } catch {}
    setGeneratingHashtags(false);
  }

  function addHashtag() {
    if (!draft || !newHashtag) return;
    const tag = newHashtag.startsWith("#") ? newHashtag : `#${newHashtag}`;
    setDraft({ ...draft, hashtags: [...draft.hashtags, tag] });
    setNewHashtag("");
  }

  function removeHashtag(index: number) {
    if (!draft) return;
    setDraft({
      ...draft,
      hashtags: draft.hashtags.filter((_, i) => i !== index),
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>Draft not found.</p>
        <button
          onClick={() => router.push("/drafts")}
          className="mt-4 text-indigo-600 hover:underline"
        >
          Back to Drafts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/drafts")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Drafts
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium text-sm disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full text-xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 p-0"
              placeholder="Draft title..."
            />
          </div>

          {/* Caption */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">Caption</label>
              <button
                onClick={handleGenerateCaption}
                disabled={generatingCaption}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {generatingCaption ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generate Caption
              </button>
            </div>
            <textarea
              value={draft.caption}
              onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
              rows={8}
              placeholder="Write your caption here or generate one with AI..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              {draft.caption.length} / 2,200 characters
            </p>
          </div>

          {/* Hashtags */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">Hashtags</label>
              <button
                onClick={handleGenerateHashtags}
                disabled={generatingHashtags}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {generatingHashtags ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Hash className="w-3.5 h-3.5" />
                )}
                Generate Hashtags
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {draft.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeHashtag(i)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                placeholder="Add hashtag..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={addHashtag}
                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              rows={4}
              placeholder="Internal notes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-medium text-slate-900">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {DRAFT_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setDraft({ ...draft, status: s })}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    draft.status === s
                      ? STATUS_COLORS[s]
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Platform & Type */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
              <select
                value={draft.platform}
                onChange={(e) =>
                  setDraft({ ...draft, platform: e.target.value as Platform })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content Type</label>
              <select
                value={draft.content_type}
                onChange={(e) =>
                  setDraft({ ...draft, content_type: e.target.value as ContentType })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct.charAt(0).toUpperCase() + ct.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
