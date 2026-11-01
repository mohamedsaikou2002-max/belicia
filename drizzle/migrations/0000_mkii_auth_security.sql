-- Phase 1: profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  inquiry_mode text not null default 'wisdom',
  response_depth text not null default 'balanced',
  strategic_context text,
  timezone text not null default 'UTC',
  spiritual_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "profiles select own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Phase 2: replace permissive public policies with ownership-scoped ones.
-- user_id stays text; ownership = user_id = auth.uid()::text.
-- Legacy rows with user_id = 'default' match no auth user -> quarantined.

-- belicia_memory
drop policy if exists "public delete memory" on public.belicia_memory;
drop policy if exists "public insert memory" on public.belicia_memory;
drop policy if exists "public read memory" on public.belicia_memory;
drop policy if exists "public update memory" on public.belicia_memory;
revoke all on public.belicia_memory from anon;
grant select, insert, update, delete on public.belicia_memory to authenticated;
grant all on public.belicia_memory to service_role;
create policy "memory select own" on public.belicia_memory for select to authenticated using (user_id = auth.uid()::text);
create policy "memory insert own" on public.belicia_memory for insert to authenticated with check (user_id = auth.uid()::text);
create policy "memory update own" on public.belicia_memory for update to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
create policy "memory delete own" on public.belicia_memory for delete to authenticated using (user_id = auth.uid()::text);

-- belicia_profile
drop policy if exists "public insert profile" on public.belicia_profile;
drop policy if exists "public read profile" on public.belicia_profile;
drop policy if exists "public update profile" on public.belicia_profile;
revoke all on public.belicia_profile from anon;
grant select, insert, update on public.belicia_profile to authenticated;
grant all on public.belicia_profile to service_role;
create policy "bprofile select own" on public.belicia_profile for select to authenticated using (user_id = auth.uid()::text);
create policy "bprofile insert own" on public.belicia_profile for insert to authenticated with check (user_id = auth.uid()::text);
create policy "bprofile update own" on public.belicia_profile for update to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

-- eagle_eye_targets
drop policy if exists "open delete eagle" on public.eagle_eye_targets;
drop policy if exists "open insert eagle" on public.eagle_eye_targets;
drop policy if exists "open read eagle" on public.eagle_eye_targets;
drop policy if exists "open update eagle" on public.eagle_eye_targets;
revoke all on public.eagle_eye_targets from anon;
grant select, insert, update, delete on public.eagle_eye_targets to authenticated;
grant all on public.eagle_eye_targets to service_role;
create policy "eagle select own" on public.eagle_eye_targets for select to authenticated using (user_id = auth.uid()::text);
create policy "eagle insert own" on public.eagle_eye_targets for insert to authenticated with check (user_id = auth.uid()::text);
create policy "eagle update own" on public.eagle_eye_targets for update to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
create policy "eagle delete own" on public.eagle_eye_targets for delete to authenticated using (user_id = auth.uid()::text);

-- home_commands (insert + read only, as before)
drop policy if exists "public insert home" on public.home_commands;
drop policy if exists "public read home" on public.home_commands;
revoke all on public.home_commands from anon;
grant select, insert on public.home_commands to authenticated;
grant all on public.home_commands to service_role;
create policy "home select own" on public.home_commands for select to authenticated using (user_id = auth.uid()::text);
create policy "home insert own" on public.home_commands for insert to authenticated with check (user_id = auth.uid()::text);

-- mirofish_sims
drop policy if exists "open delete mirofish" on public.mirofish_sims;
drop policy if exists "open read mirofish" on public.mirofish_sims;
drop policy if exists "open update mirofish" on public.mirofish_sims;
drop policy if exists "open write mirofish" on public.mirofish_sims;
revoke all on public.mirofish_sims from anon;
grant select, insert, update, delete on public.mirofish_sims to authenticated;
grant all on public.mirofish_sims to service_role;
create policy "sims select own" on public.mirofish_sims for select to authenticated using (user_id = auth.uid()::text);
create policy "sims insert own" on public.mirofish_sims for insert to authenticated with check (user_id = auth.uid()::text);
create policy "sims update own" on public.mirofish_sims for update to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
create policy "sims delete own" on public.mirofish_sims for delete to authenticated using (user_id = auth.uid()::text);

-- pemf_readings (no update, as before)
drop policy if exists "public delete pemf" on public.pemf_readings;
drop policy if exists "public insert pemf" on public.pemf_readings;
drop policy if exists "public read pemf" on public.pemf_readings;
revoke all on public.pemf_readings from anon;
grant select, insert, delete on public.pemf_readings to authenticated;
grant all on public.pemf_readings to service_role;
create policy "pemf select own" on public.pemf_readings for select to authenticated using (user_id = auth.uid()::text);
create policy "pemf insert own" on public.pemf_readings for insert to authenticated with check (user_id = auth.uid()::text);
create policy "pemf delete own" on public.pemf_readings for delete to authenticated using (user_id = auth.uid()::text);

-- scheduled_briefs
drop policy if exists "public delete briefs" on public.scheduled_briefs;
drop policy if exists "public insert briefs" on public.scheduled_briefs;
drop policy if exists "public read briefs" on public.scheduled_briefs;
drop policy if exists "public update briefs" on public.scheduled_briefs;
revoke all on public.scheduled_briefs from anon;
grant select, insert, update, delete on public.scheduled_briefs to authenticated;
grant all on public.scheduled_briefs to service_role;
create policy "briefs select own" on public.scheduled_briefs for select to authenticated using (user_id = auth.uid()::text);
create policy "briefs insert own" on public.scheduled_briefs for insert to authenticated with check (user_id = auth.uid()::text);
create policy "briefs update own" on public.scheduled_briefs for update to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
create policy "briefs delete own" on public.scheduled_briefs for delete to authenticated using (user_id = auth.uid()::text);

-- Helpful indexes
create index if not exists idx_memory_user_session on public.belicia_memory (user_id, session_id, created_at desc);
create index if not exists idx_briefs_user on public.scheduled_briefs (user_id, scheduled_for);
create index if not exists idx_pemf_user on public.pemf_readings (user_id, timestamp desc);