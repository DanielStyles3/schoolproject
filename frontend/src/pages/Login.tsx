import LoginForm from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/AuthProvider";
import { ArrowRight, BookOpenCheck, School2, ShieldCheck } from "lucide-react";
import { Link, Navigate } from "react-router";

const Login = () => {
  const { user, loading } = useAuth();

  if (user && !loading) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-svh overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(0,132,61,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,214,0,0.16),transparent_26%),linear-gradient(180deg,#F5F7FA_0%,#FFFFFF_100%)]">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1fr)_460px]">
          <section className="hidden space-y-8 lg:block">
            <Link to="/" className="inline-flex items-center gap-3 text-[#111111]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00843D] text-white shadow-[0_16px_28px_rgba(0,132,61,0.20)]">
                <School2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#4B5563]">YabaTech Portal</p>
                <p className="text-2xl font-black">Academic System</p>
              </div>
            </Link>

            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-[#FFD600] bg-[#FFF9CC] px-4 py-2 text-sm font-semibold text-[#111111]">
                Course registration and result checking
              </p>
              <h1 className="max-w-2xl text-4xl font-black leading-tight text-[#111111] sm:text-5xl">
                Sign in to continue your school workflow.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#4B5563]">
                Use the account created by the school admin to open your dashboard, manage courses,
                enter results, or check published grades.
              </p>
            </div>

            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#E8F5EE] bg-white p-4 shadow-[0_16px_32px_rgba(0,132,61,0.07)]">
                <BookOpenCheck className="mb-3 h-5 w-5 text-[#00843D]" />
                <p className="font-bold text-[#111111]">Course and result tools</p>
                <p className="mt-1 text-sm leading-6 text-[#4B5563]">One portal for student and teacher academic tasks.</p>
              </div>
              <div className="rounded-2xl border border-[#E8F5EE] bg-white p-4 shadow-[0_16px_32px_rgba(0,132,61,0.07)]">
                <ShieldCheck className="mb-3 h-5 w-5 text-[#00843D]" />
                <p className="font-bold text-[#111111]">Role-based access</p>
                <p className="mt-1 text-sm leading-6 text-[#4B5563]">Students, teachers, and admins see the right workspace.</p>
              </div>
            </div>
          </section>

          <Card className="w-full max-w-[560px] justify-self-center overflow-hidden border-[#E8F5EE] bg-white shadow-[0_30px_70px_rgba(0,132,61,0.12)] lg:max-w-none">
            <CardHeader className="space-y-3 border-b border-[#E8F5EE] bg-[#F5F7FA] px-5 py-6 sm:px-6">
              <div className="lg:hidden">
                <Link to="/" className="mb-4 inline-flex items-center gap-3 text-[#111111]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00843D] text-white">
                    <School2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4B5563]">YabaTech Portal</p>
                    <p className="text-lg font-black">Academic System</p>
                  </div>
                </Link>
              </div>
              <CardTitle className="text-3xl font-black text-[#111111]">Sign In</CardTitle>
              <CardDescription className="text-base leading-7 text-[#4B5563]">
                Enter your school account details to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-5 py-6 sm:px-6">
              <LoginForm />

              <div className="rounded-2xl border border-[#E8F5EE] bg-[#F5F7FA] p-4 text-center text-sm leading-6 text-[#4B5563]">
                Student and teacher accounts are created by the school admin.
              </div>

              <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#00843D] hover:text-[#006B31]">
                Back to homepage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;