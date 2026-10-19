-- Spectra anonymous daily rankings — Supabase (Postgres) backend.
--
-- Run this once in your project's SQL editor (Dashboard → SQL → New query → Run),
-- or with the Supabase CLI: `supabase db execute --file supabase/schema.sql`.
--
-- Design:
--   * One table, locked down with Row Level Security — anon clients can't touch it
--     directly. All access goes through two SECURITY DEFINER functions, callable
--     with the public anon key.
--   * submit_score() inserts at most one row per (day, client) and returns today's
--     live distribution. get_distribution() just reads it.
--   * Anti-abuse: one score per client per day (primary key), strict range checks,
--     and the client id is only ever stored as an md5 dedupe hash.

create table if not exists public.scores (
  day         integer     not null,
  client_hash text        not null,
  score       integer     not null check (score between 0 and 1000),
  created_at  timestamptz not null default now(),
  primary key (day, client_hash)
);

create index if not exists scores_day_idx on public.scores (day);

alter table public.scores enable row level security;
-- No policies on purpose: with RLS on and no policy, the anon/authenticated roles
-- cannot read or write the table directly. Only the SECURITY DEFINER functions below
-- (which run as the table owner) can.

-- Read today's distribution: 20 buckets of 50 points, total players, and the mean.
create or replace function public.get_distribution(p_day integer)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with bounded as (
    select least(19, greatest(0, score / 50)) as bucket
    from public.scores
    where day = p_day
  ),
  counts as (
    select bucket, count(*)::int as c from bounded group by bucket
  ),
  dense as (
    select g as bucket, coalesce(counts.c, 0) as c
    from generate_series(0, 19) as g
    left join counts on counts.bucket = g
  )
  select jsonb_build_object(
    'buckets', (select jsonb_agg(c order by bucket) from dense),
    'total',   (select count(*) from public.scores where day = p_day),
    'mean',    (select coalesce(round(avg(score)), 0) from public.scores where day = p_day)
  );
$$;

-- Submit a score (insert-once per day + client) and return the fresh distribution.
create or replace function public.submit_score(p_day integer, p_score integer, p_client text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
begin
  if p_day is null or p_day < 0 or p_day > 100000 then
    raise exception 'bad day';
  end if;
  if p_score is null or p_score < 0 or p_score > 1000 then
    raise exception 'bad score';
  end if;
  if p_client is null or length(p_client) < 8 or length(p_client) > 128 then
    raise exception 'bad client';
  end if;

  v_hash := md5(p_client || ':' || p_day::text);

  insert into public.scores (day, client_hash, score)
  values (p_day, v_hash, p_score)
  on conflict (day, client_hash) do nothing;

  return public.get_distribution(p_day);
end;
$$;

-- Let the public (anon) and signed-in roles call just these two functions.
grant execute on function public.get_distribution(integer) to anon, authenticated;
grant execute on function public.submit_score(integer, integer, text) to anon, authenticated;
