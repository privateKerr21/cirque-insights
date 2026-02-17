import { createClient } from "@/lib/supabase-server";
import { generateContent } from "@/lib/gemini";
import { PROMPT_TEMPLATES } from "@/lib/constants";
import { NextResponse } from "next/server";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  // Get brand context
  const { data: settings } = await supabase.from("brand_settings").select("key, value");
  const brand: Record<string, string> = {};
  settings?.forEach((s) => (brand[s.key] = s.value));

  // Get recent metrics (last 14 days)
  const twoWeeksAgo = format(subDays(new Date(), 14), "yyyy-MM-dd");
  const { data: insights } = await supabase
    .from("insights")
    .select("*")
    .gte("date", twoWeeksAgo)
    .order("date", { ascending: true });

  let recentMetrics = "No recent metrics available.";
  if (insights && insights.length > 0) {
    recentMetrics = insights
      .map(
        (i) =>
          `${i.date} (${i.platform}): ${i.followers} followers, ${i.reach} reach, ${i.engagement_rate}% engagement, ${i.likes} likes`
      )
      .join("\n");
  }

  // Find calendar gaps this month
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const { data: events } = await supabase
    .from("calendar_events")
    .select("date")
    .gte("date", format(monthStart, "yyyy-MM-dd"))
    .lte("date", format(monthEnd, "yyyy-MM-dd"));

  const eventDates = new Set(events?.map((e) => e.date) || []);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const gapDays = allDays
    .filter((d) => !eventDates.has(format(d, "yyyy-MM-dd")))
    .map((d) => format(d, "EEE, MMM d"));

  const calendarGaps =
    gapDays.length > 0
      ? `Days without scheduled content: ${gapDays.slice(0, 10).join(", ")}${gapDays.length > 10 ? ` and ${gapDays.length - 10} more` : ""}`
      : "All days this month have scheduled content.";

  try {
    const prompt = PROMPT_TEMPLATES.suggestions(brand, recentMetrics, calendarGaps);
    const result = await generateContent(prompt);

    await supabase.from("ai_generations").insert({
      generation_type: "suggestions",
      prompt,
      response: result.text,
      model: result.model,
      tokens_used: result.tokens,
    });

    return NextResponse.json({ suggestions: result.text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate suggestions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
