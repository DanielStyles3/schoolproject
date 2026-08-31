import { Link } from "react-router";
import {
  ArrowRight,
  BookOpenCheck,
  Database,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

const actors = [
  {
    title: "Student",
    description: "Signs in, registers courses, tracks approval status, and views published results.",
    icon: GraduationCap,
  },
  {
    title: "Lecturer",
    description: "Reviews registrations, manages assigned courses, and records CA and exam scores.",
    icon: BookOpenCheck,
  },
  {
    title: "Admin",
    description: "Configures classes, courses, academic sessions, and user accounts across the system.",
    icon: UserCog,
  },
];

const frontendModules = [
  "Authentication and role-based access",
  "Student dashboard",
  "Lecturer dashboard",
  "Admin dashboard",
  "Course registration module",
  "Result management module",
];

const backendModules = [
  "Supabase Auth",
  "PostgreSQL database",
  "Express API server",
  "Response mapping layer",
  "Protected role-based routes",
  "Academic session logic",
];

const tables = [
  "users",
  "academic_years",
  "classes",
  "subjects",
  "course_registrations",
  "results",
];

const registrationFlow = [
  "Student signs in to the system",
  "Student selects the active academic session",
  "Student chooses available courses from the assigned class",
  "Submission is saved in course registrations",
  "Admin reviews and approves the registration",
];

const resultFlow = [
  "Lecturer selects class, student, and assigned course",
  "CA and exam scores are entered into the results module",
  "The system computes total score, grade, and quality points",
  "Approved results are stored for the current session",
  "Student views published results and GPA-style summary",
];

const Architecture = () => {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              Project Documentation
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-3xl">
              Unified Student System Architecture
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              A React frontend and Supabase-backed academic system for student course registration,
              result management, and role-based administration in a YabaTech student project.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            >
              Open System
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {actors.map((actor) => (
            <article
              key={actor.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-muted text-primary">
                <actor.icon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold">{actor.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{actor.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Layers3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">System Layers</h3>
                <p className="text-sm text-muted-foreground">
                  The project is organized into presentation, business logic, and data layers.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-lg border border-border bg-surface-muted p-5">
                <div className="mb-3 flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <h4 className="text-lg font-bold text-foreground">React Web App</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {frontendModules.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-accent bg-accent-soft p-5">
                <div className="mb-3 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-foreground" />
                  <h4 className="text-lg font-bold text-foreground">Backend and Security</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {backendModules.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-accent bg-card px-3 py-1 text-xs font-semibold text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface-muted p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <h4 className="text-lg font-bold text-foreground">Core Database Tables</h4>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tables.map((table) => (
                    <div
                      key={table}
                      className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
                    >
                      {table}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-foreground">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Access Model</h3>
                <p className="text-sm text-muted-foreground">
                  Each user role enters through authentication and sees only permitted modules.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                "Shared Entry",
                "Student Access",
                "Lecturer Access",
                "Admin Access",
              ].map((label, index) => (
                <div key={label} className="rounded-lg border border-border bg-surface-muted p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-primary">{label}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {index === 0 &&
                      "Authentication, session bootstrapping, and role-based route protection determine whether the user enters student, lecturer, or admin features."}
                    {index === 1 && "Students use the dashboard, registration page, and published result view."}
                    {index === 2 &&
                      "Lecturers review registrations, enter results, and work only within assigned courses."}
                    {index === 3 &&
                      "Admins configure sessions, classes, courses, lecturers, and student records."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-2xl font-semibold text-foreground">A. Online Course Registration Flow</h3>
            <div className="mt-6 space-y-4">
              {registrationFlow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-xl border border-border bg-surface-muted p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-accent bg-accent-soft p-8 shadow-sm">
            <h3 className="text-2xl font-semibold text-foreground">B. Student Result Management Flow</h3>
            <div className="mt-6 space-y-4">
              {resultFlow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-xl border border-accent bg-card p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-primary bg-primary p-8 text-primary-foreground shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-accent-soft">Summary</p>
              <h3 className="mt-2 text-3xl font-semibold">
                Built with React, Supabase Auth, PostgreSQL, and role-based access control
              </h3>
              <p className="mt-4 text-sm leading-7 text-primary-foreground/85">
                The system architecture supports the full academic cycle from user authentication
                to course registration, result computation, and dashboard reporting.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-foreground transition hover:bg-accent-hover"
            >
              Test The System
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Architecture;


