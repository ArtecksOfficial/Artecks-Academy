-- ─── Artecks Academy — Initial Schema ────────────────────────────────────────
-- Single consolidated migration for a clean database.
-- All statements are idempotent (IF NOT EXISTS / OR REPLACE).

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── sessions ──────────────────────────────────────────────────────────────────
create table if not exists sessions (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  title                text not null,
  topic                text,
  age_group            text,
  location_name        text not null,
  location_address     text,
  private_access_notes text,
  start_time           timestamptz not null,
  end_time             timestamptz not null,
  price_twd            integer not null default 0,
  capacity             integer not null default 10,
  max_seats            integer not null default 10,
  booking_open         boolean not null default true,
  status               text not null default 'open'
                         check (status in ('open', 'full', 'completed', 'cancelled'))
);

-- ── bookings ──────────────────────────────────────────────────────────────────
create table if not exists bookings (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  session_id           uuid not null references sessions(id) on delete cascade,
  parent_name          text not null,
  parent_phone         text not null,
  student_name         text not null,
  student_age          integer not null,
  -- Multi-channel contact (replaces parent_line_id)
  contact_method       text not null default 'whatsapp'
                         check (contact_method in ('whatsapp', 'line', 'sms', 'email')),
  contact_value        text not null,
  -- Artecks ecosystem
  artecks_account_id   text,
  artecks_identifier   text,
  -- Payment
  payment_status       text not null default 'pending'
                         check (payment_status in ('pending', 'confirmed', 'cancelled')),
  payment_last5        text,
  -- Attendance & rewards
  attended             boolean not null default false,
  rewards_credited     boolean not null default false,
  -- Legacy alias kept for coach cockpit queries
  status               text not null default 'confirmed'
                         check (status in ('confirmed', 'cancelled'))
);

create index if not exists bookings_session_id_idx on bookings(session_id);
create index if not exists bookings_parent_phone_idx on bookings(parent_phone);

-- ── lesson_reports ────────────────────────────────────────────────────────────
create table if not exists lesson_reports (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  booking_id          uuid not null unique references bookings(id) on delete cascade,
  skill_tags          text[] not null default '{}',
  coach_notes         text not null,
  generated_summary   text,
  xp_awarded          integer not null default 100,
  coins_awarded       integer not null default 30
);

create index if not exists lesson_reports_booking_id_idx on lesson_reports(booking_id);

-- ── book_session_atomic RPC ───────────────────────────────────────────────────
create or replace function book_session_atomic(
  p_session_id         uuid,
  p_parent_name        text,
  p_student_name       text,
  p_student_age        integer,
  p_contact_method     text,
  p_contact_value      text,
  p_payment_last5      text      default null,
  p_artecks_identifier text      default null
) returns json
language plpgsql
security definer
as $$
declare
  v_session         record;
  v_confirmed_count integer;
  v_booking_id      uuid;
begin
  -- Lock session row to prevent concurrent overbooking
  select * into v_session
    from sessions
    where id = p_session_id
    for update;

  if not found then
    return json_build_object('success', false, 'error', 'Session not found');
  end if;

  if v_session.status != 'open' then
    return json_build_object('success', false, 'error', 'Session is closed or cancelled');
  end if;

  if not v_session.booking_open then
    return json_build_object('success', false, 'error', 'Booking is not open for this session');
  end if;

  select count(*) into v_confirmed_count
    from bookings
    where session_id = p_session_id
      and status = 'confirmed';

  if v_confirmed_count >= v_session.max_seats then
    return json_build_object('success', false, 'error', 'Session is completely full');
  end if;

  insert into bookings (
    session_id,
    parent_name,
    student_name,
    student_age,
    contact_method,
    contact_value,
    payment_last5,
    artecks_identifier,
    status
  ) values (
    p_session_id,
    p_parent_name,
    p_student_name,
    p_student_age,
    p_contact_method,
    p_contact_value,
    p_payment_last5,
    p_artecks_identifier,
    'confirmed'
  )
  returning id into v_booking_id;

  return json_build_object(
    'success',              true,
    'booking_id',           v_booking_id,
    'private_access_notes', v_session.private_access_notes
  );
end;
$$;

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table sessions      enable row level security;
alter table bookings      enable row level security;
alter table lesson_reports enable row level security;

-- Public can read open sessions
create policy "sessions_public_read"
  on sessions for select
  using (status in ('open', 'full'));

-- Anon can insert bookings (booking form is public)
create policy "bookings_anon_insert"
  on bookings for insert
  with check (true);

-- Service role bypasses RLS for coach cockpit and server actions
-- (service role key used in createServerClient bypasses RLS automatically)

-- ── Grants ────────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select on sessions to anon, authenticated;
grant insert on bookings to anon;
grant select, insert, update on bookings to authenticated;
grant select, insert, update on lesson_reports to authenticated;

grant execute on function book_session_atomic(
  uuid, text, text, integer, text, text, text, text
) to anon, authenticated;
