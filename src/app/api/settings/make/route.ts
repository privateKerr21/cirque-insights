import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get API key
  const { data: apiKeySetting } = await supabase
    .from("brand_settings")
    .select("value")
    .eq("user_id", user.id)
    .eq("key", "make_api_key")
    .single();

  // Get recent sync logs
  const { data: syncLogs } = await supabase
    .from("make_sync_log")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    hasApiKey: !!apiKeySetting?.value,
    apiKey: apiKeySetting?.value ?? null,
    syncLogs: syncLogs ?? [],
  });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate a new API key
  const apiKey = `mk_${randomBytes(24).toString("hex")}`;

  // Upsert the API key
  const { error: keyError } = await supabase
    .from("brand_settings")
    .upsert(
      { user_id: user.id, key: "make_api_key", value: apiKey },
      { onConflict: "user_id,key" }
    );

  if (keyError) {
    return NextResponse.json({ error: keyError.message }, { status: 500 });
  }

  // Also store the user_id for webhook lookups
  await supabase
    .from("brand_settings")
    .upsert(
      { user_id: user.id, key: "make_user_id", value: user.id },
      { onConflict: "user_id,key" }
    );

  return NextResponse.json({ apiKey });
}
