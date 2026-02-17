"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Plus, Loader2, BarChart3 } from "lucide-react";
import { METRICS, PLATFORMS } from "@/lib/constants";
import type { Insight, Platform } from "@/lib/types";

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["followers", "reach"]);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  // Form state
  const [form, setForm] = useState({
    platform: "instagram" as Platform,
    date: format(new Date(), "yyyy-MM-dd"),
    followers: 0,
    reach: 0,
    impressions: 0,
    engagement_rate: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    profile_visits: 0,
  });

  const fetchInsights = useCallback(async () => {
    const res = await fetch(
      `/api/insights?start=${dateRange.start}&end=${dateRange.end}`
    );
    const data = await res.json();
    if (Array.isArray(data)) setInsights(data);
    setLoading(false);
  }, [dateRange]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    setShowForm(false);
    fetchInsights();
  }

  function toggleMetric(key: string) {
    setSelectedMetrics((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  }

  // Build chart data merged by date
  const chartMap = new Map<string, Record<string, number | string>>();
  insights.forEach((i) => {
    const existing = chartMap.get(i.date) || { date: i.date };
    METRICS.forEach(({ key }) => {
      existing[`${i.platform}_${key}`] = Number(i[key as keyof Insight] ?? 0);
    });
    chartMap.set(i.date, existing);
  });
  const chartData = Array.from(chartMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Insights</h1>
          <p className="text-slate-500 mt-1">Track and visualize your social media metrics</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Data
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-slate-900">Add Daily Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            {METRICS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input
                  type="number"
                  step={key === "engagement_rate" ? "0.01" : "1"}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Date Range & Metric Selectors */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">From</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">To</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {METRICS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedMetrics.includes(key)
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              style={selectedMetrics.includes(key) ? { backgroundColor: color } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Trends</h3>
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => format(new Date(v + "T00:00:00"), "MMM d")}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {PLATFORMS.map((platform) =>
                selectedMetrics.map((metric) => {
                  const metricConfig = METRICS.find((m) => m.key === metric);
                  if (!metricConfig) return null;
                  const strokeColor =
                    platform === "instagram"
                      ? metricConfig.color
                      : `${metricConfig.color}99`;
                  return (
                    <Line
                      key={`${platform}_${metric}`}
                      type="monotone"
                      dataKey={`${platform}_${metric}`}
                      stroke={strokeColor}
                      name={`${platform === "instagram" ? "IG" : "TT"} ${metricConfig.label}`}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  );
                })
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
            <BarChart3 className="w-12 h-12 mb-3" />
            <p>No data for this date range. Add some metrics above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
