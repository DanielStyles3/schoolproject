# Backend

## Purpose

This backend powers a Yaba College of Technology student project focused on:

- online course registration
- student result management

## Stack

- Bun
- Express
- TypeScript
- Supabase Auth
- Supabase PostgreSQL

## Run

```bash
bun install
bun run src/server.ts
```

Default server URL:

```bash
http://localhost:5000
```

## Required Environment Variables

- `PORT`
- `STAGE`
- `CLIENT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Main API Groups

- `/api/users`
- `/api/academic-years`
- `/api/classes`
- `/api/courses`
- `/api/course-registrations`
- `/api/results`
- `/api/dashboard`

Compatibility alias:

- `/api/subjects`

## Notes

- Controllers use the Supabase service-role client for database work.
- Authentication is resolved in middleware before protected controllers run.
- Response data is normalized for the frontend by `responseMapper`.
