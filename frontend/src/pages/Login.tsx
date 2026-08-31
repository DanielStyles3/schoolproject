import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/AuthProvider";
import { BookOpenCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { Navigate } from "react-router";
import BrandLockup from "@/components/global/BrandLockup";

const highlights = [
  {
    icon: BookOpenCheck,
    title: "Course registration",
    description: "Students register their courses for the active session online.",
  },
  {
    icon: GraduationCap,
    title: "Result management",
    description: "Lecturers record CA and exam scores, then publish to students.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description: "Students, lecturers, and admins each see their own workspace.",
  },
];

const Login = () => {
  const { user, loading } = useAuth();

  if (user && !loading) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_minmax(0,1fr)]">
      {/* Institutional panel. The official logo ships on a #216015 field, which
          is exactly --brand-deep, so the lockup sits flush with no plate. */}
      <aside className="relative hidden overflow-hidden bg-brand-deep lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Kept flat behind the logo on purpose: the official artwork has a
            baked-in #216015 field, so any gradient here would reveal it as a
            rectangle. Decoration stays low and to the right, clear of it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary-bright/10 blur-3xl"
        />

        <BrandLockup tone="light" size="lg" className="relative" />

        <div className="relative space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Academic Portal
            </p>
            <h1 className="max-w-md text-4xl font-semibold leading-[1.15] tracking-tight text-white">
              Course registration and result management, in one place.
            </h1>
            <p className="max-w-md text-base leading-7 text-white/70">
              Sign in with the account issued by the college administrator to open
              your dashboard.
            </p>
          </div>

          <ul className="max-w-md space-y-3">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4"
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-white/65">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/50">
          <span className="font-medium text-white/70">Labore et Veritate</span>
          <span className="mx-2">·</span>
          Established 1947
        </p>
      </aside>

      {/* Sign-in column */}
      <main className="flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <BrandLockup size="md" className="mb-8 lg:hidden" />

          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Sign in
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Enter your college account details to access your dashboard.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 border-t border-border pt-6 text-sm leading-6 text-muted-foreground">
            Student and lecturer accounts are created by the college
            administrator. Contact the admin office if you cannot sign in.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
