import { createClient } from "@/lib/supabase-server";
import { generateContent } from "@/lib/gemini";
import { PROMPT_TEMPLATES } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import type { GenerationType } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getBrandContext(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from("brand_settings").select("key, value");
  const brand: Record<string, string> = {};
  data?.forEach((s) => (brand[s.key] = s.value));
  return brand;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const {
    type,
    topic,
    platform,
    contentType,
    days,
  }: {
    type: GenerationType;
    topic?: string;
    platform?: string;
    contentType?: string;
    days?: number;
  } = body;

  const brand = await getBrandContext(supabase);

  let prompt: string;
  switch (type) {
    case "caption":
      prompt = PROMPT_TEMPLATES.caption(brand, topic || "", platform || "instagram", contentType || "post");
      break;
    case "hashtags":
      prompt = PROMPT_TEMPLATES.hashtags(brand, topic || "", platform || "instagram");
      break;
    case "ideas":
      prompt = PROMPT_TEMPLATES.ideas(brand, platform || "instagram");
      break;
    case "post_plan":
      prompt = PROMPT_TEMPLATES.post_plan(brand, platform || "instagram", days || 7);
      break;
    default:
      return NextResponse.json({ error: "Invalid generation type" }, { status: 400 });
  }

  try {
    const result = await generateContent(prompt);

    // Log the generation
    await supabase.from("ai_generations").insert({
      generation_type: type,
      prompt,
      response: result.text,
      model: result.model,
      tokens_used: result.tokens,
    });

    return NextResponse.json({
      content: result.text,
      tokens: result.tokens,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
