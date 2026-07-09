# EduNexus

EduNexus is a Yaba College of Technology student project built around two core academic processes:

- online course registration
- student result management

## Application Structure

- `frontend/`
  React + TypeScript + Vite user interface
- `backend/`
  Express + Bun + Supabase API layer

## Core User Roles

- `admin`
- `teacher`
- `student`

## Main Features

- user management
- class management
- course management
- academic year management
- student course registration
- registration approval
- result entry
- result summary and GPA-style calculation

## Main Frontend Routes

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

## Main Backend API Routes

- `/api/users`
- `/api/academic-years`
- `/api/classes`
- `/api/courses`
- `/api/course-registrations`
- `/api/results`
- `/api/dashboard/stats`

## Architecture

See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for the detailed system architecture and route design.
