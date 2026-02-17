import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const platform = searchParams.get("platform");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  let query = supabase
    .from("insights")
    .select("*")
    .order("date", { ascending: true });

  if (platform) query = query.eq("platform", platform);
  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("insights")
    .upsert(body, { onConflict: "platform,date" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
