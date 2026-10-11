-- One at a Time: server-only matching. No direct public table or RPC writes.
create table if not exists public.oat_matches (
 id uuid primary key default gen_random_uuid(),
 user_a uuid not null references auth.users(id),
 user_b uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 ended_at timestamptz,
 ended_by uuid references auth.users(id),
 end_reason text,
 check (user_a < user_b),
 check ((ended_at is null and ended_by is null and end_reason is null) or
        (ended_at is not null and ended_by in (user_a,user_b) and length(btrim(end_reason)) between 4 and 240))
);
create table if not exists public.oat_active_members (
 user_id uuid primary key references auth.users(id),
 match_id uuid not null references public.oat_matches(id)
);
create index if not exists oat_active_match_idx on public.oat_active_members(match_id);
create table if not exists public.oat_member_locks (
 user_id uuid primary key references auth.users(id)
);
create table if not exists public.oat_likes (
 user_id uuid not null references auth.users(id),
 target_id uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 primary key(user_id,target_id), check(user_id <> target_id)
);
create table if not exists public.oat_messages (
 id uuid primary key default gen_random_uuid(),
 match_id uuid not null references public.oat_matches(id),
 sender_id uuid not null references auth.users(id),
 content text not null check(length(btrim(content)) between 1 and 2000),
 created_at timestamptz not null default now()
);
create index if not exists oat_message_match_idx on public.oat_messages(match_id,created_at);
alter table public.oat_matches enable row level security;
alter table public.oat_active_members enable row level security;
alter table public.oat_likes enable row level security;
alter table public.oat_member_locks enable row level security;
alter table public.oat_messages enable row level security;
revoke all on public.oat_matches,public.oat_active_members,public.oat_likes,public.oat_messages,public.oat_member_locks from public,anon,authenticated;
grant all on public.oat_matches,public.oat_active_members,public.oat_likes,public.oat_messages,public.oat_member_locks to service_role;

create or replace function public.oat_like(p_actor uuid,p_target uuid) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare v_match uuid;
begin
 if p_actor = p_target then raise exception 'You cannot match with yourself.'; end if;
 -- Lock both people in the same order to serialize overlapping match requests.
 insert into public.oat_member_locks(user_id) select x from unnest(array[p_actor,p_target]) as x order by x on conflict do nothing;
 perform user_id from public.oat_member_locks where user_id in (p_actor,p_target) order by user_id for update;
 if (select count(*) from public.member_profiles where user_id in (p_actor,p_target) and status='active' and not is_test and profile_complete and birth_date <= current_date - interval '18 years') <> 2
 then raise exception 'Both people need complete adult profiles.'; end if;
 if exists(select 1 from public.oat_active_members where user_id = p_actor) then raise exception 'End your current match before browsing again.'; end if;
 if exists(select 1 from public.oat_active_members where user_id = p_target) then raise exception 'This person is already matched.'; end if;
 insert into public.oat_likes(user_id,target_id) values(p_actor,p_target) on conflict do nothing;
 if exists(select 1 from public.oat_likes where user_id=p_target and target_id=p_actor) then
  insert into public.oat_matches(user_a,user_b) values(least(p_actor,p_target),greatest(p_actor,p_target)) returning id into v_match;
  insert into public.oat_active_members(user_id,match_id) values(p_actor,v_match),(p_target,v_match);
  -- A new mutual match clears both people's outstanding interest.
  delete from public.oat_likes where user_id in (p_actor,p_target) or target_id in (p_actor,p_target);
  return jsonb_build_object('matched',true,'match_id',v_match);
 end if;
 return jsonb_build_object('matched',false);
end $$;
revoke all on function public.oat_like(uuid,uuid) from public,anon,authenticated;
grant execute on function public.oat_like(uuid,uuid) to service_role;

create or replace function public.oat_end_match(p_actor uuid,p_reason text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare v_match public.oat_matches%rowtype;
begin
 if length(btrim(coalesce(p_reason,''))) not between 4 and 240 then raise exception 'Give a respectful reason between 4 and 240 characters.'; end if;
 select m.* into v_match from public.oat_matches m join public.oat_active_members a on a.match_id=m.id where a.user_id=p_actor;
 if v_match.id is null then raise exception 'No active match.'; end if;
 perform user_id from public.oat_member_locks where user_id in (v_match.user_a,v_match.user_b) order by user_id for update;
 update public.oat_matches set ended_at=now(),ended_by=p_actor,end_reason=btrim(p_reason) where id=v_match.id and ended_at is null;
 if not found then raise exception 'This match already ended.'; end if;
 delete from public.oat_active_members where match_id=v_match.id;
 return jsonb_build_object('ended',true);
end $$;
revoke all on function public.oat_end_match(uuid,text) from public,anon,authenticated;
grant execute on function public.oat_end_match(uuid,text) to service_role;

create or replace function public.oat_send_message(p_actor uuid,p_content text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare v_match uuid;
begin
 select m.id into v_match from public.oat_matches m join public.oat_active_members a on a.match_id=m.id where a.user_id=p_actor and m.ended_at is null for share of m;
 if v_match is null then raise exception 'You need an active mutual match to message.'; end if;
 insert into public.oat_messages(match_id,sender_id,content) values(v_match,p_actor,btrim(p_content));
 return jsonb_build_object('sent',true);
end $$;
revoke all on function public.oat_send_message(uuid,text) from public,anon,authenticated;
grant execute on function public.oat_send_message(uuid,text) to service_role;
