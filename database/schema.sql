-- ============================================================
-- NC Issues — Full Database Schema
-- Run this in the Supabase SQL Editor to reset + rebuild all tables.
-- https://supabase.com/dashboard/project/bmwzjybppjneyejlsjpv/sql
-- ============================================================

-- ── Drop existing tables (clean slate) ──────────────────────
drop table if exists public.scraping_logs cascade;
drop table if exists public.bill_history cascade;
drop table if exists public.legislative_events cascade;
drop table if exists public.committees cascade;
drop table if exists public.bills cascade;

-- ── bills ───────────────────────────────────────────────────
create table public.bills (
  id               uuid default gen_random_uuid() primary key,
  bill_number      text unique not null,
  title            text not null,
  chamber          text check (chamber in ('house', 'senate')),
  status           text default 'Filed',
  primary_sponsor  text,
  summary          text,
  introduced_date  date,
  last_action      text,
  last_action_date date,
  ncleg_url        text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index bills_chamber_idx       on public.bills(chamber);
create index bills_status_idx        on public.bills(status);
create index bills_last_action_idx   on public.bills(last_action_date desc);
create index bills_introduced_idx    on public.bills(introduced_date desc);

-- ── bill_history ─────────────────────────────────────────────
create table public.bill_history (
  id          uuid default gen_random_uuid() primary key,
  bill_id     uuid references public.bills(id) on delete cascade,
  action_date date,
  action      text,
  chamber     text,
  created_at  timestamptz default now(),
  unique (bill_id, action_date, action)
);

create index bill_history_bill_idx  on public.bill_history(bill_id);
create index bill_history_date_idx  on public.bill_history(action_date desc);

-- ── legislative_events ───────────────────────────────────────
create table public.legislative_events (
  id          uuid default gen_random_uuid() primary key,
  event_date  date not null,
  start_time  text,
  chamber     text,
  event_type  text,
  description text,
  location    text,
  is_public   boolean default true,
  source_url  text,
  created_at  timestamptz default now(),
  unique (event_date, description, chamber)
);

create index events_date_idx    on public.legislative_events(event_date desc);
create index events_chamber_idx on public.legislative_events(chamber);

-- ── committees ───────────────────────────────────────────────
create table public.committees (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  chamber         text,
  committee_type  text,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  unique (name, chamber)
);

create index committees_chamber_idx on public.committees(chamber);

-- ── scraping_logs ────────────────────────────────────────────
create table public.scraping_logs (
  id                 uuid default gen_random_uuid() primary key,
  source             text not null,
  status             text not null,
  records_processed  integer default 0,
  message            text,
  created_at         timestamptz default now()
);

-- ── legislators — add missing counties column ────────────────
alter table public.legislators add column if not exists counties text;

-- ── RLS: enable and allow public read on all tables ──────────
alter table public.bills              enable row level security;
alter table public.bill_history       enable row level security;
alter table public.legislative_events enable row level security;
alter table public.committees         enable row level security;
alter table public.scraping_logs      enable row level security;

create policy "Public read" on public.bills              for select using (true);
create policy "Public read" on public.bill_history       for select using (true);
create policy "Public read" on public.legislative_events for select using (true);
create policy "Public read" on public.committees         for select using (true);
create policy "Public read" on public.scraping_logs      for select using (true);

-- Allow anon inserts (needed for scraper running with publishable key)
create policy "Anon insert" on public.bills              for insert with check (true);
create policy "Anon insert" on public.bill_history       for insert with check (true);
create policy "Anon insert" on public.legislative_events for insert with check (true);
create policy "Anon insert" on public.committees         for insert with check (true);
create policy "Anon insert" on public.scraping_logs      for insert with check (true);
create policy "Anon update" on public.bills              for update using (true);
create policy "Anon update" on public.bill_history       for update using (true);

select 'Schema created successfully' as result;
