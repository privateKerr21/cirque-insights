import { createAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

const METRIC_FIELDS = [
  "followers",
  "reach",
  "impressions",
  "engagement_rate",
  "likes",
  "comments",
  "shares",
  "saves",
  "profile_visits",
] as const;

const VALID_PLATFORMS = ["instagram", "tiktok"];

function validateRecord(record: unknown): string | null {
  if (typeof record !== "object" || record === null) {
    return "Each record must be an object";
  }

  const r = record as Record<string, unknown>;

  if (!r.platform || !VALID_PLATFORMS.includes(r.platform as string)) {
    return `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(", ")}`;
  }

  if (!r.date || typeof r.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) {
    return "Invalid date. Must be in YYYY-MM-DD format";
  }

  for (const field of METRIC_FIELDS) {
    if (r[field] !== undefined && typeof r[field] !== "number") {
      return `Field "${field}" must be a number`;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing x-api-key header" },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();

  // Look up the API key in brand_settings to find the user
  const { data: keySetting } = await supabase
    .from("brand_settings")
    .select("user_id")
    .eq("key", "make_api_key")
    .eq("value", apiKey)
    .single();

  if (!keySetting) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const userId = keySetting.user_id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Normalize to array for batch processing
  const records = Array.isArray(body) ? body : [body];

  if (records.length === 0) {
    return NextResponse.json({ error: "Empty payload" }, { status: 400 });
  }

  // Validate all records
  for (let i = 0; i < records.length; i++) {
    const err = validateRecord(records[i]);
    if (err) {
      return NextResponse.json(
        { error: `Record ${i}: ${err}` },
        { status: 400 }
      );
    }
  }

  // Build rows with user_id
  const rows = records.map((r: Record<string, unknown>) => ({
    user_id: userId,
    platform: r.platform,
    date: r.date,
    followers: r.followers ?? 0,
    reach: r.reach ?? 0,
    impressions: r.impressions ?? 0,
    engagement_rate: r.engagement_rate ?? 0,
    likes: r.likes ?? 0,
    comments: r.comments ?? 0,
    shares: r.shares ?? 0,
    saves: r.saves ?? 0,
    profile_visits: r.profile_visits ?? 0,
  }));

  // Upsert into insights
  const { data, error } = await supabase
    .from("insights")
    .upsert(rows, { onConflict: "platform,date" })
    .select();

  // Determine platform(s) for the log
  const platforms = [...new Set(records.map((r: Record<string, unknown>) => r.platform))].join(", ");

  if (error) {
    // Log the failed sync
    await supabase.from("make_sync_log").insert({
      user_id: userId,
      platform: platforms,
      records_synced: 0,
      status: "error",
      error_message: error.message,
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the successful sync
  await supabase.from("make_sync_log").insert({
    user_id: userId,
    platform: platforms,
    records_synced: data.length,
    status: "success",
  });

  return NextResponse.json({
    success: true,
    records_synced: data.length,
    data,
  });
}
