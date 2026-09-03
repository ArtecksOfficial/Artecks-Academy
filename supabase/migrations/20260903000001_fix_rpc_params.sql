-- Fix book_session_atomic: add p_parent_phone and p_artecks_account_id

create or replace function book_session_atomic(
  p_session_id         uuid,
  p_parent_name        text,
  p_parent_phone       text,
  p_student_name       text,
  p_student_age        integer,
  p_contact_method     text,
  p_contact_value      text,
  p_artecks_account_id text      default null,
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

  -- Check for duplicate booking (same student in same session)
  if exists (
    select 1 from bookings
    where session_id = p_session_id
      and student_name = p_student_name
      and status = 'confirmed'
  ) then
    return json_build_object('success', false, 'error', 'Student is already booked for this session');
  end if;

  insert into bookings (
    session_id,
    parent_name,
    parent_phone,
    student_name,
    student_age,
    contact_method,
    contact_value,
    artecks_account_id,
    artecks_identifier,
    payment_last5,
    status
  ) values (
    p_session_id,
    p_parent_name,
    p_parent_phone,
    p_student_name,
    p_student_age,
    p_contact_method,
    p_contact_value,
    p_artecks_account_id,
    p_artecks_identifier,
    p_payment_last5,
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

-- Revoke old grant (old signature) and re-grant with new signature
revoke execute on function book_session_atomic(
  uuid, text, text, integer, text, text, text, text
) from anon, authenticated;

grant execute on function book_session_atomic(
  uuid, text, text, text, integer, text, text, text, text, text
) to anon, authenticated;
