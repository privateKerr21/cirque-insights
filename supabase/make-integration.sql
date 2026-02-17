-- Make Integration: Sync Log Table
-- Run this migration in your Supabase SQL editor

create table if not exists make_sync_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null,
  records_synced integer not null default 0,
  status text not null check (status in ('success', 'error')),
  error_message text,
  created_at timestamptz default now()
);

alter table make_sync_log enable row level security;

create policy "Users can view own sync logs"
  on make_sync_log for select
  using (auth.uid() = user_id);

-- Index for faster lookups by user
create index if not exists idx_make_sync_log_user_id on make_sync_log(user_id);
create index if not exists idx_make_sync_log_created_at on make_sync_log(created_at desc);

-- The API key and target user_id are stored in the existing brand_settings table:
--   key = 'make_api_key', value = '<plain text api key>'
--   key = 'make_user_id', value = '<user uuid>'
-- These are inserted via the Settings page API.
