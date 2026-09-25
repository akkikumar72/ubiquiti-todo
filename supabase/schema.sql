-- Daymark is ONE SHARED WORKSPACE for all authenticated accounts in this project.
-- Run in a dedicated Supabase project. Review existing policies before migrating.
-- This file is provided for setup; it is never executed by the application.
begin;
create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  name text, username text, avatar_url text
);
create table if not exists public.tweets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  is_completed boolean not null default false,
  user_id uuid not null references public.profile(id) on delete cascade
);
alter table public.tweets add column if not exists notes text not null default '';
alter table public.tweets add column if not exists project text not null default 'Personal';
alter table public.tweets add column if not exists priority text not null default 'medium';
alter table public.tweets add column if not exists status text not null default 'todo';
alter table public.tweets add column if not exists due_date date;
update public.tweets set status = 'done' where is_completed = true and status <> 'done';
-- Add constraints only once, retaining original task IDs and titles.
do $$ begin
  if not exists(select 1 from pg_constraint where conname='daymark_priority' and conrelid='public.tweets'::regclass) then
    alter table public.tweets add constraint daymark_priority check (priority in ('high','medium','low'));
  end if;
  if not exists(select 1 from pg_constraint where conname='daymark_status' and conrelid='public.tweets'::regclass) then
    alter table public.tweets add constraint daymark_status check (status in ('todo','progress','done'));
  end if;
end $$;
create or replace function public.daymark_create_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profile(id,name,username,avatar_url)
  values(new.id,coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1)),new.raw_user_meta_data->>'user_name',new.raw_user_meta_data->>'avatar_url')
  on conflict(id) do nothing;
  return new;
end;
$$;
drop trigger if exists daymark_profile_on_signup on auth.users;
create trigger daymark_profile_on_signup after insert on auth.users for each row execute function public.daymark_create_profile();
insert into public.profile(id,name)
select id,coalesce(raw_user_meta_data->>'name',split_part(email,'@',1)) from auth.users
on conflict(id) do nothing;

alter table public.profile enable row level security;
alter table public.tweets enable row level security;
-- Only these named policies are managed here. Existing policies need a manual audit.
drop policy if exists daymark_profiles_read on public.profile;
create policy daymark_profiles_read on public.profile for select to authenticated using (true);
drop policy if exists daymark_tasks_read on public.tweets;
create policy daymark_tasks_read on public.tweets for select to authenticated using (true);
drop policy if exists daymark_tasks_insert on public.tweets;
create policy daymark_tasks_insert on public.tweets for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists daymark_tasks_update on public.tweets;
create policy daymark_tasks_update on public.tweets for update to authenticated using (true) with check (true);
drop policy if exists daymark_tasks_delete on public.tweets;
create policy daymark_tasks_delete on public.tweets for delete to authenticated using (true);
grant select on public.profile to authenticated;
grant select,insert,update,delete on public.tweets to authenticated;
-- Realtime keeps other signed-in clients up to date.
do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='tweets') then
    alter publication supabase_realtime add table public.tweets;
  end if;
end $$;
commit;
