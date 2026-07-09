# EduNexus System Architecture

## Project Focus

This system is a Yaba College of Technology student project centered on two core academic workflows:

1. Online course registration
2. Student result management

Other school-management features were intentionally removed or reduced so the final system stays aligned with the approved project scope.

## High-Level Architecture

### Frontend

- React + TypeScript + Vite
- Role-based interface for:
  - `admin`
  - `teacher`
  - `student`
- Main frontend areas:
  - Landing page
  - Authentication
  - Dashboard
  - Students
  - Teachers
  - Classes
  - Courses
  - Course Registration
  - Results
  - Academic Years

### Backend

- Express + TypeScript running on Bun
- Supabase used for:
  - authentication
  - PostgreSQL database
- Main backend layers:
  - `routes/`
  - `controllers/`
  - `middleware/`
  - `config/`
  - `utils/`

### Database

Core tables used by the final project:

- `users`
- `academic_years`
- `classes`
- `subjects`
- `course_registrations`
- `results`

## Request Flow

1. User signs in through the frontend.
2. Backend validates the Supabase token/cookie.
3. Protected routes populate `req.user`.
4. Controllers query Supabase with the service-role client.
5. Response mapper converts backend field names to frontend-friendly names.

## Route Design

### Public

- `GET /`
- `POST /api/users/login`
- `POST /api/users/register`

### Core Academic API

- `GET|POST|PATCH|DELETE /api/users`
- `GET|POST|PATCH|DELETE /api/academic-years`
- `GET|POST|PUT|DELETE /api/classes`
- `GET|POST|PATCH|DELETE /api/courses`
- `GET|POST /api/course-registrations`
- `PATCH /api/course-registrations/:id/status`
- `GET|POST /api/results`
- `GET /api/dashboard/stats`

### Compatibility Alias

- `/api/subjects` is still mounted as an alias of `/api/courses`

## Role Responsibilities

### Admin

- Manage students
- Manage teachers
- Manage classes
- Manage courses
- Manage academic years
- Review and approve registrations
- Enter and review results

### Teacher

- View assigned classes
- View assigned courses
- Enter student results
- Review registrations

### Student

- View dashboard
- Register courses
- View results

## Frontend Route Structure

- `/`
- `/login`
- `/dashboard`
- `/users/students`
- `/users/teachers`
- `/classes`
- `/courses`
- `/course-registration`
- `/results`
- `/settings/academic-years`

## Important Design Choices

- `subjects` in the database represent academic courses
- `courses` is the preferred UI and API language
- `subjects` is kept as a backend alias to avoid breaking older code
- result summaries include grade totals and GPA-style computation
- registration approval is separated from submission

## Recommended Next Improvements

1. Add semester support
2. Add printable registration slip
3. Add printable result transcript
4. Add audit logs for result edits
5. Add automated tests for core routes
