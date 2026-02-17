export const PLATFORMS = ["instagram", "tiktok"] as const;
export const DRAFT_STATUSES = ["draft", "review", "approved", "posted"] as const;
export const CONTENT_TYPES = ["post", "reel", "story", "carousel", "tiktok"] as const;
export const GENERATION_TYPES = ["caption", "hashtags", "ideas", "post_plan"] as const;

export const METRICS = [
  { key: "followers", label: "Followers", color: "#6366f1" },
  { key: "reach", label: "Reach", color: "#8b5cf6" },
  { key: "impressions", label: "Impressions", color: "#a78bfa" },
  { key: "engagement_rate", label: "Engagement Rate", color: "#c084fc" },
  { key: "likes", label: "Likes", color: "#e879f9" },
  { key: "comments", label: "Comments", color: "#f472b6" },
  { key: "shares", label: "Shares", color: "#fb7185" },
  { key: "saves", label: "Saves", color: "#f87171" },
  { key: "profile_visits", label: "Profile Visits", color: "#fb923c" },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  posted: "bg-blue-100 text-blue-700",
};

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  tiktok: "bg-slate-100 text-slate-700",
};

export const PROMPT_TEMPLATES = {
  caption: (brand: Record<string, string>, topic: string, platform: string, contentType: string) =>
    `You are a social media copywriter for ${brand.name || "a premium brand"}.
Brand voice: ${brand.voice || "premium, aspirational, authentic"}
Target audience: ${brand.audience || "outdoor enthusiasts"}
Content pillars: ${brand.content_pillars || "adventure, quality, style"}

Write a compelling ${platform} ${contentType} caption about: ${topic}

Requirements:
- Match the brand voice exactly
- Include a hook in the first line
- Include a call-to-action
- Keep it under 2200 characters
- Do NOT include hashtags (those will be generated separately)

Return only the caption text.`,

  hashtags: (brand: Record<string, string>, topic: string, platform: string) =>
    `You are a social media strategist for ${brand.name || "a premium brand"}.
Brand hashtags: ${brand.hashtags || "#adventure #outdoors"}

Generate 20-30 relevant ${platform} hashtags for a post about: ${topic}

Mix of:
- 5 brand-specific hashtags
- 10 niche hashtags (10K-500K posts)
- 10 broader hashtags (500K-5M posts)

Return only the hashtags, space-separated.`,

  ideas: (brand: Record<string, string>, platform: string) =>
    `You are a content strategist for ${brand.name || "a premium brand"}.
Brand voice: ${brand.voice || "premium, aspirational, authentic"}
Target audience: ${brand.audience || "outdoor enthusiasts"}
Content pillars: ${brand.content_pillars || "adventure, quality, style"}

Generate 10 creative ${platform} content ideas for this brand.

For each idea, provide:
1. A catchy title
2. Content type (post/reel/story/carousel)
3. A brief description (2-3 sentences)
4. Best time to post

Format as a numbered list.`,

  post_plan: (brand: Record<string, string>, platform: string, days: number) =>
    `You are a content strategist for ${brand.name || "a premium brand"}.
Brand voice: ${brand.voice || "premium, aspirational, authentic"}
Content pillars: ${brand.content_pillars || "adventure, quality, style"}

Create a ${days}-day ${platform} content plan.

For each day, provide:
1. Content type
2. Topic/theme
3. Caption concept (1-2 sentences)
4. Best posting time

Format as a structured daily plan.`,

  suggestions: (brand: Record<string, string>, recentMetrics: string, calendarGaps: string) =>
    `You are a social media strategist for ${brand.name || "a premium brand"}.
Brand voice: ${brand.voice || "premium, aspirational, authentic"}
Content pillars: ${brand.content_pillars || "adventure, quality, style"}

Based on these recent performance metrics:
${recentMetrics}

And these gaps in the content calendar:
${calendarGaps}

Provide 3-5 actionable suggestions to improve social media performance.
Be specific and reference the data. Keep each suggestion to 2-3 sentences.
Format as a numbered list.`,
};
