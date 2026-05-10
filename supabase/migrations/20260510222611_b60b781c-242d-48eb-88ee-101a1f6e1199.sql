
create table if not exists public.mirofish_sims (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'default',
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists mirofish_sims_user_idx on public.mirofish_sims(user_id, updated_at desc);
alter table public.mirofish_sims enable row level security;
create policy "open read mirofish" on public.mirofish_sims for select using (true);
create policy "open write mirofish" on public.mirofish_sims for insert with check (true);
create policy "open update mirofish" on public.mirofish_sims for update using (true);
create policy "open delete mirofish" on public.mirofish_sims for delete using (true);
