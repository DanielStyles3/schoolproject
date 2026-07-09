# YabaTech Academic System Documentation

## Overview

YabaTech Academic System is a school portal for managing students, teachers, classes, courses, course registration, and student results.

The app currently uses:

- React, TypeScript, and Vite for the frontend.
- Supabase Auth for login and password recovery.
- Supabase PostgreSQL for school data.
- Supabase Row Level Security for role-based access.
- Supabase Edge Functions for secure admin user management.

The frontend now talks to Supabase through `frontend/src/lib/api.ts`. The Express backend folder remains in the project as legacy/reference code and for SQL migration files, but it is not the main runtime backend for the current app flow.

## User Roles

### Admin

Admins manage the school setup.

Admins can:

- Create and manage students.
- Create and manage teachers.
- Assign students to classes.
- Assign teachers to courses.
- Create and manage academic years.
- Create and manage classes.
- Create and manage courses.
- Attach courses to classes.
- View registrations and results.

### Teacher

Teachers manage academic work for their assigned courses.

Teachers can:

- View dashboard information.
- View assigned courses/classes.
- Enter CA and exam scores.
- Save draft results.
- Publish results for assigned courses.

### Student

Students use the portal for registration and result checking.

Students can:

- Log in.
- View dashboard.
- Register courses available for their class.
- View published results.
- Update profile information.

## Main Routes

Public routes:

- `/` - Homepage
- `/architecture` - Architecture page
- `/login` - Login
- `/forgot-password` - Password reset

Protected routes:

- `/dashboard` - Role-aware dashboard
- `/settings/profile` - Profile settings
- `/results` - Results page

Student-only route:

- `/course-registration` - Student course registration

Admin and teacher routes:

- `/users/students` - Student management
- `/classes` - Class management
- `/courses` or `/subjects` - Course management

Admin-only routes:

- `/users/teachers` - Teacher management
- `/settings/academic-years` - Academic year management

Route definition file:

- `frontend/src/pages/routes/router.tsx`

## Core Workflows

### Login

1. User enters email and password.
2. `frontend/src/lib/api.ts` calls Supabase Auth.
3. Supabase returns a session.
4. The app loads the user's profile from the `users` table.
5. Routes and dashboard content are shown based on role.

Important files:

- `frontend/src/lib/supabase.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/hooks/AuthProvider.tsx`
- `frontend/src/components/auth/LoginForm.tsx`

### Admin Creates Student

Students do not self-register. Admin creates students.

1. Admin opens Students.
2. Admin enters name, email, password, and class.
3. Frontend calls the `admin-users` Supabase Edge Function.
4. Edge Function creates the Supabase Auth user.
5. Edge Function creates the profile in `users`.
6. Student is linked to the selected class.

Important files:

- `frontend/src/components/auth/UniversalUserForm.tsx`
- `frontend/src/lib/api.ts`
- `supabase/functions/admin-users/index.ts`

### Admin Creates Teacher

1. Admin opens Teachers.
2. Admin enters teacher details.
3. Admin assigns one or more courses.
4. Edge Function creates the Auth user and profile.
5. Teacher-course assignments are synced.

### Admin Creates Course

Courses are stored in the `subjects` table.

1. Admin opens Courses.
2. Admin creates a course with name, code, unit, teacher, and selected classes.
3. Frontend inserts the course into Supabase.
4. Frontend updates selected classes so the course ID is stored in each class `subjects` array.
5. Students assigned to those classes can see the course during course registration.

Important files:

- `frontend/src/components/subjects/SubjectForm.tsx`
- `frontend/src/pages/academics/Subjects.tsx`
- `frontend/src/lib/api.ts`

A course appears for a student only when:

- The course is active.
- The student's class is selected on the course.
- The student is assigned to that class.
- A current academic year exists.

### Student Course Registration

1. Student opens Course Registration.
2. App loads the current academic year.
3. App loads the student's assigned class.
4. App loads active courses attached to that class.
5. Student selects courses.
6. Registration is saved in `course_registrations`.

Important files:

- `frontend/src/pages/academics/CourseRegistration.tsx`
- `frontend/src/lib/api.ts`

### Teacher Records Results

1. Teacher opens Results.
2. App shows courses/classes related to the teacher's assigned courses.
3. Teacher enters CA score and exam score.
4. App calculates total, grade, remark, and quality points.
5. Teacher saves draft result.
6. Teacher publishes result when ready.
7. Student can only see published results.

Important files:

- `frontend/src/pages/academics/Results.tsx`
- `frontend/src/lib/api.ts`

### Student Checks Results

1. Student opens Results.
2. App loads only published results for that student.
3. App shows course, score, grade, remark, unit, and GPA summary.

## Database Tables

The main SQL lives in:

- `backend/supabase_migration.sql`
- `supabase/migrations/20260629000000_yabatech_academic_system.sql`

### `academic_years`

Stores school sessions.

Important columns:

- `id`
- `name`
- `from_year`
- `to_year`
- `is_current`

### `users`

Stores profiles for Supabase Auth users.

Important columns:

- `id`
- `name`
- `email`
- `role`
- `student_class`
- `teacher_subject`
- `is_active`

Roles:

- `admin`
- `teacher`
- `student`

### `subjects`

Stores courses.

Important columns:

- `id`
- `name`
- `code`
- `unit`
- `teacher`
- `is_active`

### `classes`

Stores classes and course links.

Important columns:

- `id`
- `name`
- `academic_year`
- `class_teacher`
- `subjects`
- `students`
- `capacity`

The `subjects` array controls which courses students in that class can register.

### `course_registrations`

Stores student course registrations.

Important columns:

- `student_id`
- `class_id`
- `academic_year_id`
- `subject_ids`
- `status`

### `results`

Stores student results.

Important columns:

- `student_id`
- `subject_id`
- `class_id`
- `academic_year_id`
- `ca_score`
- `exam_score`
- `total_score`
- `grade`
- `remark`
- `quality_points`
- `result_status`

Result statuses:

- `draft`
- `published`

## Supabase Security

Row Level Security is enabled on the main tables.

Policies are role-aware:

- Admins can manage school setup records.
- Teachers can work with results for assigned subjects.
- Students can register their own courses and view their own published results.

Helper functions used by RLS:

- `public.current_user_role()`
- `public.current_user_subject_ids()`
- `public.current_user_class_id()`

The service role key is used only in secure server-side places such as the Supabase Edge Function. It must not be exposed in frontend code.

## Supabase Edge Function

Function name:

- `admin-users`

Location:

- `supabase/functions/admin-users/index.ts`

Purpose:

- Create users through Supabase Auth Admin API.
- Update users.
- Delete users.
- Update the logged-in user's own profile.
- Sync student class membership.
- Sync teacher course assignments.

Deploy command:

```bash
npx supabase functions deploy admin-users --project-ref your_project_ref
```

## Environment Variables

### Frontend

File:

- `frontend/.env.local`

Required:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Only the anon key belongs in the frontend.

### Backend / Local Admin Scripts

File:

- `backend/.env`

Required:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The service role key must stay private.

## Running Locally

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start frontend:

```bash
npm run dev
```

Build frontend:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

The Express backend is not required for the current Supabase-first frontend flow.

## Deployment

### Frontend

Deploy the `frontend` folder to Vercel.

Required Vercel environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

After changing environment variables, redeploy the frontend.

### Supabase

Link project:

```bash
npx supabase link --project-ref your_project_ref
```

Apply migrations:

```bash
npx supabase db push --linked
```

Deploy Edge Function:

```bash
npx supabase functions deploy admin-users --project-ref your_project_ref
```

## Design Theme

The app uses a YabaTech-style theme.

Palette:

- Primary Green: `#00843D`
- Deep Green: `#006B31`
- Light Green: `#E8F5EE`
- Primary Yellow: `#FFD600`
- Gold Yellow: `#E6B800`
- Black: `#111111`
- Dark Gray: `#4B5563`
- Light Gray: `#F5F7FA`
- White: `#FFFFFF`
- Red: `#DC2626`
- Blue: `#2563EB`

The UI should stay light, clean, and school-friendly. Avoid dark page backgrounds.

## Troubleshooting

### Invalid API Key on Login

Likely causes:

- Wrong `VITE_SUPABASE_ANON_KEY`.
- Missing `frontend/.env.local`.
- Vercel environment variable is missing or stale.

Fix:

1. Confirm frontend uses the Supabase anon key, not the service role key.
2. Update `frontend/.env.local`.
3. Restart Vite dev server.
4. If on Vercel, update environment variables and redeploy.

### Course Does Not Show for Student

Check:

- Course is active.
- Course is attached to the student's class.
- Student is assigned to the correct class.
- Current academic year exists.

### Teacher Cannot Enter Result

Check:

- Teacher has the course in `users.teacher_subject`.
- Course has the teacher ID in `subjects.teacher`.
- Students registered the course.
- RLS migration has been applied.

### Student Cannot See Result

Check:

- Result exists for the student.
- Result status is `published`.
- Student is logged in with the correct account.

### Vite Looks for Removed Axios

Cause:

- Vite dependency optimizer cache is stale.

Fix on Windows PowerShell:

```powershell
cd frontend
Remove-Item -LiteralPath node_modules/.vite -Recurse -Force
npm run dev
```

## Go-Live Checklist

Before production use:

- Frontend build passes.
- Supabase migration is applied.
- `admin-users` Edge Function is active.
- Vercel has `VITE_SUPABASE_URL`.
- Vercel has `VITE_SUPABASE_ANON_KEY`.
- At least one admin account exists.
- One academic year is current.
- Students are assigned to classes.
- Courses are attached to classes.
- Teachers are assigned to courses.
- Students can register courses.
- Teachers can enter and publish results.
- Students can view published results.

## Important Files

Frontend:

- `frontend/src/lib/supabase.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/hooks/AuthProvider.tsx`
- `frontend/src/pages/routes/router.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/academics/CourseRegistration.tsx`
- `frontend/src/pages/academics/Results.tsx`
- `frontend/src/pages/academics/Subjects.tsx`
- `frontend/src/pages/academics/Classes.tsx`
- `frontend/src/pages/users/index.tsx`

Supabase:

- `supabase/functions/admin-users/index.ts`
- `supabase/migrations/20260629000000_yabatech_academic_system.sql`

Legacy/reference backend:

- `backend/supabase_migration.sql`
- `backend/src/controllers/subject.ts`
- `backend/src/controllers/user.ts`
- `backend/src/controllers/result.ts`
- `backend/src/controllers/courseRegistration.ts`
