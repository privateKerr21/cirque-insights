"use client";

import { useEffect, useState, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORMS, CONTENT_TYPES } from "@/lib/constants";
import type { CalendarEvent, Platform, ContentType } from "@/lib/types";

const EVENT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    platform: "instagram" as Platform | "",
    content_type: "post" as ContentType | "",
    color: EVENT_COLORS[0],
    notes: "",
  });

  const fetchEvents = useCallback(async () => {
    const month = format(currentMonth, "MM");
    const year = format(currentMonth, "yyyy");
    const res = await fetch(`/api/calendar?month=${month}&year=${year}`);
    const data = await res.json();
    if (Array.isArray(data)) setEvents(data);
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  function openCreate(date: Date) {
    setSelectedDate(date);
    setEditingEvent(null);
    setForm({
      title: "",
      platform: "instagram",
      content_type: "post",
      color: EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)],
      notes: "",
    });
    setShowModal(true);
  }

  function openEdit(event: CalendarEvent) {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date + "T00:00:00"));
    setForm({
      title: event.title,
      platform: (event.platform || "") as Platform | "",
      content_type: (event.content_type || "") as ContentType | "",
      color: event.color,
      notes: event.notes,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title || !selectedDate) return;
    setSaving(true);

    const payload = {
      title: form.title,
      date: format(selectedDate, "yyyy-MM-dd"),
      platform: form.platform || null,
      content_type: form.content_type || null,
      color: form.color,
      notes: form.notes,
    };

    if (editingEvent) {
      await fetch("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingEvent.id, ...payload }),
      });
    } else {
      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setShowModal(false);
    fetchEvents();
  }

  async function handleDelete() {
    if (!editingEvent) return;
    await fetch(`/api/calendar?id=${editingEvent.id}`, { method: "DELETE" });
    setShowModal(false);
    fetchEvents();
  }

  function getEventsForDay(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.date + "T00:00:00"), day));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Content Calendar</h1>
        <p className="text-slate-500 mt-1">Plan and schedule your content</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="px-3 py-2 text-center text-xs font-semibold text-slate-500 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={i}
                onClick={() => openCreate(day)}
                className={cn(
                  "min-h-[120px] p-2 border-b border-r border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors",
                  !inMonth && "bg-slate-50/50"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                    today
                      ? "bg-indigo-600 text-white font-bold"
                      : inMonth
                        ? "text-slate-900"
                        : "text-slate-300"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(event);
                      }}
                      className="w-full text-left px-2 py-1 rounded text-xs font-medium text-white truncate"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-xs text-slate-400 px-2">
                      +{dayEvents.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 m-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingEvent ? "Edit Event" : "New Event"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedDate && (
              <p className="text-sm text-slate-500">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Product launch reel"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value as Platform | "" })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">None</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={form.content_type}
                  onChange={(e) =>
                    setForm({ ...form, content_type: e.target.value as ContentType | "" })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">None</option>
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct.charAt(0).toUpperCase() + ct.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
              <div className="flex gap-2">
                {EVENT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className={cn(
                      "w-8 h-8 rounded-full transition-transform",
                      form.color === color && "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.title}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingEvent ? "Update" : "Create"}
              </button>
              {editingEvent && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
