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
  "Lecturer or admin reviews and approves the registration",
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
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(0,132,61,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(244,196,48,0.10),transparent_28%),#ffffff] text-[#111111]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-[#E8F5EE] bg-white p-6 shadow-[0_24px_60px_rgba(0,132,61,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#00843D]">
              Project Documentation
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
              Unified Student System Architecture
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4B5563] sm:text-base">
              A React frontend and Supabase-backed academic system for student course registration,
              result management, and role-based administration in a YabaTech student project.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-full border border-[#E8F5EE] bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#FFD600] hover:bg-[#FFFBE6]"
            >
              Back To Home
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-[#00843D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006B31]"
            >
              Open System
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {actors.map((actor) => (
            <article
              key={actor.title}
              className="rounded-[1.75rem] border border-[#E8F5EE] bg-white p-6 shadow-[0_18px_35px_rgba(0,132,61,0.05)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F5EE] text-[#00843D]">
                <actor.icon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black">{actor.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#4B5563]">{actor.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-[#E8F5EE] bg-white p-8 shadow-[0_18px_35px_rgba(0,132,61,0.05)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00843D] text-white">
                <Layers3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black">System Layers</h3>
                <p className="text-sm text-[#4B5563]">
                  The project is organized into presentation, business logic, and data layers.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#F5F7FA] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5 text-[#00843D]" />
                  <h4 className="text-lg font-bold text-[#111111]">React Web App</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {frontendModules.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#E8F5EE] bg-white px-3 py-1 text-xs font-semibold text-[#111111]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[#FFD600] bg-[#FFF9CC] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#111111]" />
                  <h4 className="text-lg font-bold text-[#4f4318]">Backend and Security</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {backendModules.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#FFD600] bg-white/80 px-3 py-1 text-xs font-semibold text-[#111111]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Database className="h-5 w-5 text-[#00843D]" />
                  <h4 className="text-lg font-bold text-[#111111]">Core Database Tables</h4>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tables.map((table) => (
                    <div
                      key={table}
                      className="rounded-xl border border-[#E8F5EE] bg-white px-4 py-3 text-sm font-semibold text-[#111111]"
                    >
                      {table}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#E8F5EE] bg-white p-8 shadow-[0_18px_35px_rgba(0,132,61,0.05)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF9CC] text-[#111111]">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Access Model</h3>
                <p className="text-sm text-[#4B5563]">
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
                <div key={label} className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#F5F7FA] p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#00843D]">{label}</p>
                  <p className="mt-2 text-sm leading-7 text-[#4B5563]">
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
          <div className="rounded-[2rem] border border-[#E8F5EE] bg-white p-8 shadow-[0_18px_35px_rgba(0,132,61,0.05)]">
            <h3 className="text-2xl font-black text-[#111111]">A. Online Course Registration Flow</h3>
            <div className="mt-6 space-y-4">
              {registrationFlow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-xl border border-[#E8F5EE] bg-[#F5F7FA] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00843D] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-[#406245]">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#FFD600] bg-[#FFF9CC] p-8 shadow-[0_18px_35px_rgba(0,132,61,0.05)]">
            <h3 className="text-2xl font-black text-[#111111]">B. Student Result Management Flow</h3>
            <div className="mt-6 space-y-4">
              {resultFlow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-xl border border-[#FFD600] bg-white/70 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFD600] text-sm font-bold text-[#111111]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-[#406245]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-[#E8F5EE] bg-[linear-gradient(135deg,#00843D,#006B31)] p-8 text-[#111111] shadow-[0_24px_70px_rgba(0,132,61,0.22)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#ffe07a]">Summary</p>
              <h3 className="mt-2 text-3xl font-black">
                Built with React, Supabase Auth, PostgreSQL, and role-based access control
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#111111]">
                The system architecture supports the full academic cycle from user authentication
                to course registration, result computation, and dashboard reporting.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#FFD600] px-5 py-3 text-sm font-bold text-[#111111] transition hover:bg-[#E6B800]"
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


