"use client";

import { useState } from "react";
import { Sparkles, Copy, FileText, Loader2, Check } from "lucide-react";
import { PLATFORMS, CONTENT_TYPES, GENERATION_TYPES } from "@/lib/constants";
import type { GenerationType, Platform, ContentType } from "@/lib/types";

export default function GeneratePage() {
  const [type, setType] = useState<GenerationType>("caption");
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [contentType, setContentType] = useState<ContentType>("post");
  const [days, setDays] = useState(7);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, topic, platform, contentType, days }),
      });
      const data = await res.json();
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(data.content);
      }
    } catch {
      setResult("Failed to generate content. Check your API key.");
    }
    setLoading(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveAsDraft() {
    setSaving(true);
    const caption = type === "caption" ? result : "";
    const hashtags =
      type === "hashtags"
        ? result
            .split(/\s+/)
            .filter((t) => t.startsWith("#"))
        : [];

    await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: topic || "AI Generated Content",
        caption,
        hashtags,
        platform,
        content_type: contentType,
        notes: type !== "caption" && type !== "hashtags" ? result : "",
      }),
    });
    setSaving(false);
    alert("Saved as draft!");
  }

  const typeLabels: Record<GenerationType, string> = {
    caption: "Caption",
    hashtags: "Hashtags",
    ideas: "Content Ideas",
    post_plan: "Post Plan",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Generate Content</h1>
        <p className="text-slate-500 mt-1">
          AI-powered content generation using your brand voice
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Generation Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GENERATION_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    type === t
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {typeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {(type === "caption" || type === "hashtags") && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct.charAt(0).toUpperCase() + ct.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Topic / Description
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  placeholder="e.g., New powder day at Whistler, showcasing our anti-fog technology..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </>
          )}

          {type === "post_plan" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Number of Days
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 7)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || ((type === "caption" || type === "hashtags") && !topic)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate
          </button>
        </div>

        {/* Result */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Generated Content</h3>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleSaveAsDraft}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Save as Draft
                </button>
              </div>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Generating with Gemini...</p>
              </div>
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
              {result}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Generated content will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
