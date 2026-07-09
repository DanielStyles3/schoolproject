-- ============================================================
-- YabaTech Academic System - Supabase PostgreSQL Migration
-- Scope: course registration + result management
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  from_year TIMESTAMPTZ NOT NULL,
  to_year TIMESTAMPTZ NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  student_class UUID,
  teacher_subject UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  unit INTEGER NOT NULL DEFAULT 3,
  teacher UUID[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CLASSES
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  academic_year UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_teacher UUID REFERENCES users(id) ON DELETE SET NULL,
  subjects UUID[] NOT NULL DEFAULT '{}',
  students UUID[] NOT NULL DEFAULT '{}',
  capacity INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, academic_year)
);

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS fk_users_student_class;

ALTER TABLE users
  ADD CONSTRAINT fk_users_student_class
  FOREIGN KEY (student_class) REFERENCES classes(id) ON DELETE SET NULL;

-- 5. COURSE REGISTRATIONS
CREATE TABLE IF NOT EXISTS course_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  subject_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year_id)
);

-- 6. RESULTS
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  ca_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  exam_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  grade TEXT NOT NULL,
  remark TEXT NOT NULL,
  quality_points NUMERIC(10,2) NOT NULL DEFAULT 0,
  result_status TEXT NOT NULL DEFAULT 'draft' CHECK (result_status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, academic_year_id)
);

ALTER TABLE results
  ADD COLUMN IF NOT EXISTS result_status TEXT NOT NULL DEFAULT 'draft';

ALTER TABLE results
  DROP CONSTRAINT IF EXISTS results_result_status_check;

ALTER TABLE results
  ADD CONSTRAINT results_result_status_check
  CHECK (result_status IN ('draft', 'published'));

-- 7. BASIC INDEXES
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_student_class ON users(student_class);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year);
CREATE INDEX IF NOT EXISTS idx_course_registrations_student_year
  ON course_registrations(student_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_results_student_year
  ON results(student_id, academic_year_id);

-- 8. RLS
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Helper functions let policies inspect the logged-in profile without recursive user-table policies.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_subject_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(teacher_subject, '{}'::uuid[]) FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_class_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT student_class FROM public.users WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_subject_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_class_id() TO authenticated;

DROP POLICY IF EXISTS "Service role full access" ON academic_years;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Service role full access" ON subjects;
DROP POLICY IF EXISTS "Service role full access" ON classes;
DROP POLICY IF EXISTS "Service role full access" ON course_registrations;
DROP POLICY IF EXISTS "Service role full access" ON results;

DROP POLICY IF EXISTS "Academic years are readable by signed-in users" ON academic_years;
DROP POLICY IF EXISTS "Admins manage academic years" ON academic_years;
DROP POLICY IF EXISTS "School users are readable by staff and self" ON users;
DROP POLICY IF EXISTS "Users can update their own basic profile" ON users;
DROP POLICY IF EXISTS "Admins manage user profiles" ON users;
DROP POLICY IF EXISTS "Subjects are readable by signed-in users" ON subjects;
DROP POLICY IF EXISTS "Admins manage subjects" ON subjects;
DROP POLICY IF EXISTS "Classes are readable by signed-in users" ON classes;
DROP POLICY IF EXISTS "Admins manage classes" ON classes;
DROP POLICY IF EXISTS "Course registrations readable by owner staff" ON course_registrations;
DROP POLICY IF EXISTS "Students submit own course registrations" ON course_registrations;
DROP POLICY IF EXISTS "Students update own course registrations" ON course_registrations;
DROP POLICY IF EXISTS "Admins manage course registrations" ON course_registrations;
DROP POLICY IF EXISTS "Results readable by role" ON results;
DROP POLICY IF EXISTS "Teachers enter assigned course results" ON results;
DROP POLICY IF EXISTS "Teachers update assigned course results" ON results;
DROP POLICY IF EXISTS "Admins manage results" ON results;

CREATE POLICY "Academic years are readable by signed-in users"
ON academic_years FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins manage academic years"
ON academic_years FOR ALL TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "School users are readable by staff and self"
ON users FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.current_user_role() IN ('admin', 'teacher')
);

CREATE POLICY "Users can update their own basic profile"
ON users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins manage user profiles"
ON users FOR ALL TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Subjects are readable by signed-in users"
ON subjects FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins manage subjects"
ON subjects FOR ALL TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Classes are readable by signed-in users"
ON classes FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins manage classes"
ON classes FOR ALL TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Course registrations readable by owner staff"
ON course_registrations FOR SELECT TO authenticated
USING (
  student_id = auth.uid()
  OR public.current_user_role() IN ('admin', 'teacher')
);

CREATE POLICY "Students submit own course registrations"
ON course_registrations FOR INSERT TO authenticated
WITH CHECK (
  student_id = auth.uid()
  AND public.current_user_role() = 'student'
  AND class_id = public.current_user_class_id()
);

CREATE POLICY "Students update own course registrations"
ON course_registrations FOR UPDATE TO authenticated
USING (student_id = auth.uid() OR public.current_user_role() = 'admin')
WITH CHECK (
  public.current_user_role() = 'admin'
  OR (
    student_id = auth.uid()
    AND public.current_user_role() = 'student'
    AND class_id = public.current_user_class_id()
  )
);

CREATE POLICY "Admins manage course registrations"
ON course_registrations FOR ALL TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Results readable by role"
ON results FOR SELECT TO authenticated
USING (
  public.current_user_role() = 'admin'
  OR (student_id = auth.uid() AND result_status = 'published')
  OR (public.current_user_role() = 'teacher' AND subject_id = ANY(public.current_user_subject_ids()))
);

CREATE POLICY "Teachers enter assigned course results"
ON results FOR INSERT TO authenticated
WITH CHECK (
  public.current_user_role() = 'teacher'
  AND subject_id = ANY(public.current_user_subject_ids())
);

CREATE POLICY "Teachers update assigned course results"
ON results FOR UPDATE TO authenticated
USING (
  public.current_user_role() = 'teacher'
  AND subject_id = ANY(public.current_user_subject_ids())
)
WITH CHECK (
  public.current_user_role() = 'teacher'
  AND subject_id = ANY(public.current_user_subject_ids())
);

CREATE POLICY "Admins manage results"
ON results FOR ALL TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');
