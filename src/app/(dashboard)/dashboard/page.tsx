"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Users,
  Eye,
  Heart,
  TrendingUp,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import type { Insight } from "@/lib/types";

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-500" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {change && (
        <p className="text-sm text-green-600 mt-1">{change}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [suggestions, setSuggestions] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    const start = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const res = await fetch(`/api/insights?start=${start}`);
    const data = await res.json();
    if (Array.isArray(data)) setInsights(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  async function fetchSuggestions() {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/suggestions");
      const data = await res.json();
      if (data.suggestions) setSuggestions(data.suggestions);
    } catch {
      setSuggestions("Unable to generate suggestions. Check your Gemini API key.");
    }
    setLoadingSuggestions(false);
  }

  // Compute latest metrics
  const latest = insights.length > 0 ? insights[insights.length - 1] : null;
  const totalFollowers = insights.reduce((max, i) => Math.max(max, i.followers), 0);
  const avgEngagement =
    insights.length > 0
      ? (insights.reduce((sum, i) => sum + Number(i.engagement_rate), 0) / insights.length).toFixed(2)
      : "0";
  const totalReach = insights.reduce((sum, i) => sum + i.reach, 0);
  const totalLikes = insights.reduce((sum, i) => sum + i.likes, 0);

  // Chart data: merge by date
  const chartMap = new Map<string, Record<string, number | string>>();
  insights.forEach((i) => {
    const existing = chartMap.get(i.date) || { date: i.date };
    existing[`${i.platform}_followers`] = i.followers;
    existing[`${i.platform}_reach`] = i.reach;
    existing[`${i.platform}_engagement`] = Number(i.engagement_rate);
    chartMap.set(i.date, existing);
  });
  const chartData = Array.from(chartMap.values()).sort(
    (a, b) => String(a.date).localeCompare(String(b.date))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Image
          src="/logo.png"
          alt="Cirque"
          width={48}
          height={48}
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your social media performance</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Followers"
          value={totalFollowers.toLocaleString()}
          icon={Users}
        />
        <MetricCard
          title="Total Reach (30d)"
          value={totalReach.toLocaleString()}
          icon={Eye}
        />
        <MetricCard
          title="Avg Engagement"
          value={`${avgEngagement}%`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Likes (30d)"
          value={totalLikes.toLocaleString()}
          icon={Heart}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Follower Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
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
                <Line
                  type="monotone"
                  dataKey="instagram_followers"
                  stroke="#e11d48"
                  name="Instagram"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tiktok_followers"
                  stroke="#0f172a"
                  name="TikTok"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              <p>No insights data yet. Add data on the Insights page.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Comparison</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => format(new Date(v + "T00:00:00"), "MMM d")}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="instagram_reach" fill="#e11d48" name="IG Reach" />
                <Bar dataKey="tiktok_reach" fill="#0f172a" name="TT Reach" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              <p>No insights data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-900">AI Suggestions</h3>
          </div>
          <button
            onClick={fetchSuggestions}
            disabled={loadingSuggestions}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            {loadingSuggestions ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Generate
          </button>
        </div>
        {suggestions ? (
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
            {suggestions}
          </div>
        ) : (
          <p className="text-slate-400">
            Click &quot;Generate&quot; to get AI-powered suggestions based on your metrics and content calendar.
          </p>
        )}
      </div>
    </div>
  );
}
