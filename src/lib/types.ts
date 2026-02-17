export type Platform = "instagram" | "tiktok";
export type DraftStatus = "draft" | "review" | "approved" | "posted";
export type ContentType = "post" | "reel" | "story" | "carousel" | "tiktok";
export type GenerationType = "caption" | "hashtags" | "ideas" | "post_plan";

export interface Insight {
  id: string;
  platform: Platform;
  date: string;
  followers: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  created_at: string;
}

export interface Draft {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  platform: Platform;
  content_type: ContentType;
  status: DraftStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  platform: Platform | null;
  content_type: ContentType | null;
  draft_id: string | null;
  color: string;
  notes: string;
  created_at: string;
}

export interface AiGeneration {
  id: string;
  generation_type: GenerationType;
  prompt: string;
  response: string;
  model: string;
  tokens_used: number;
  created_at: string;
}

export interface BrandSetting {
  id: string;
  key: string;
  value: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  platform: string;
  records_synced: number;
  status: "success" | "error";
  error_message: string | null;
  created_at: string;
}
