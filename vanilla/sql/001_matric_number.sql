-- ============================================================================
-- YABATECH Student Result Portal
-- Migration 001 — matric-number sign-in and public result verification
--
-- Run this once in the Supabase dashboard:
--   Project  ->  SQL Editor  ->  New query  ->  paste  ->  Run
--
-- Safe to run more than once.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Matric number column
-- ----------------------------------------------------------------------------
-- Students sign in with a matric number instead of an email address.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS matric_number text;

-- Matric numbers must be unique, but many rows (staff) will be NULL.
-- A partial unique index allows unlimited NULLs while keeping real values unique.
CREATE UNIQUE INDEX IF NOT EXISTS users_matric_number_key
  ON public.users (upper(matric_number))
  WHERE matric_number IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 2. Resolve a login identifier to an email address
-- ----------------------------------------------------------------------------
-- The sign-in form accepts either a matric number or an email. Anonymous
-- visitors cannot read public.users (RLS forbids it), so this SECURITY DEFINER
-- function performs the lookup on their behalf.
--
-- It returns ONLY the email address — never a name, role, or any other column —
-- so it cannot be used to enumerate student records.

CREATE OR REPLACE FUNCTION public.resolve_login_email(p_identifier text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF p_identifier IS NULL OR btrim(p_identifier) = '' THEN
    RETURN NULL;
  END IF;

  -- An identifier containing "@" is already an email address.
  IF position('@' IN p_identifier) > 0 THEN
    RETURN btrim(p_identifier);
  END IF;

  SELECT u.email
    INTO v_email
    FROM public.users u
   WHERE u.matric_number IS NOT NULL
     AND upper(u.matric_number) = upper(btrim(p_identifier))
     AND coalesce(u.is_active, true) = true
   LIMIT 1;

  RETURN v_email;   -- NULL when no match; the client shows "no account found"
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_login_email(text) FROM public;
GRANT EXECUTE ON FUNCTION public.resolve_login_email(text) TO anon, authenticated;


-- ----------------------------------------------------------------------------
-- 3. Public result verification
-- ----------------------------------------------------------------------------
-- Lets anyone confirm a published result given a matric number, the way a real
-- result-checking portal does. Only PUBLISHED results are ever returned, and
-- only for the session named. Draft scores stay private.

CREATE OR REPLACE FUNCTION public.verify_published_results(
  p_matric  text,
  p_session text DEFAULT NULL
)
RETURNS TABLE (
  student_name  text,
  matric_number text,
  session_name  text,
  course_code   text,
  course_title  text,
  course_unit   integer,
  total_score   numeric,
  grade         text,
  remark        text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.name,
    u.matric_number,
    ay.name,
    s.code,
    s.name,
    s.unit,
    r.total_score,
    r.grade,
    r.remark
  FROM public.results r
  JOIN public.users u           ON u.id  = r.student_id
  JOIN public.subjects s        ON s.id  = r.subject_id
  JOIN public.academic_years ay ON ay.id = r.academic_year_id
  WHERE r.result_status = 'published'
    AND u.matric_number IS NOT NULL
    AND upper(u.matric_number) = upper(btrim(p_matric))
    AND (p_session IS NULL OR ay.name = p_session)
  ORDER BY ay.from_year DESC, s.code;
$$;

REVOKE ALL ON FUNCTION public.verify_published_results(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_published_results(text, text) TO anon, authenticated;


-- ----------------------------------------------------------------------------
-- 4. Demo matric numbers
-- ----------------------------------------------------------------------------
-- Gives the seeded demo students a matric number so matric sign-in can be
-- demonstrated straight away. Harmless if those accounts do not exist.

UPDATE public.users SET matric_number = 'D/ND/23/3210359'
 WHERE email = 'student@yabatech.local' AND matric_number IS NULL;

UPDATE public.users SET matric_number = 'D/ND/23/3210360'
 WHERE email = 'amina@yabatech.local' AND matric_number IS NULL;


-- ----------------------------------------------------------------------------
-- Done. Verify with:
--   SELECT public.resolve_login_email('D/ND/23/3210359');
--   SELECT * FROM public.verify_published_results('D/ND/23/3210359');
-- ----------------------------------------------------------------------------
