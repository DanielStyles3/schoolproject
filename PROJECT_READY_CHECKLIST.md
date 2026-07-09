# YabaTech Academic System Readiness Checklist

## Demo Accounts

- Admin: `admin@yabatech.local`
- Teacher: `teacher@yabatech.local`
- Student with approved registration and results: `student@yabatech.local`
- Student with pending registration: `amina@yabatech.local`
- Shared password: `ChangeMe123!`

## Project Scope Covered

- Student result management
- Online course registration
- Role-based access for admin, teacher, and student
- Dashboard views for each user role
- Public student registration
- Responsive landing, login, register, and dashboard pages

## Presentation Walkthrough

1. Open the homepage and explain the landing page, focus modules, and architecture page.
2. Sign in as admin and show class, course, teacher, student, and academic year management.
3. Open course registration management and show pending versus approved submissions.
4. Sign in as teacher and show assigned courses, pending registrations, and result entry.
5. Sign in as the main student and show approved registration plus published results and GPA.
6. Sign in as the pending student and show a submitted registration waiting for staff action.

## Before Submission

- Run `bun run seed:demo` inside `backend`
- Start backend with `bun run dev` or `bun run start`
- Start frontend with `npm run dev` inside `frontend`
- Confirm Supabase environment variables are set in `backend/.env`
- Confirm homepage, login, register, dashboard, course registration, and results pages load correctly
- Confirm admin, teacher, and student accounts can all sign in
- Confirm the current academic year is set to `2025/2026`

## Notes

- The project is intentionally scoped to course registration and result management.
- The seeded data is idempotent, so you can run the seed script again without duplicating records.
