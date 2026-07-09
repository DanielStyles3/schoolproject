import { useState } from "react";
import { ArrowLeft, MailCheck, School2 } from "lucide-react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";

const ForgotPassword = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  if (user && !loading) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    try {
      const response = await api.post("/users/forgot-password", { email });
      toast.success(response.data?.message || "Password reset link sent.");
      setEmail("");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send reset instructions right now.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-svh overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(10,143,47,0.10),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(244,196,48,0.12),transparent_26%),#f8fff7]">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1fr)_460px]">
          <section className="hidden space-y-8 lg:block">
            <Link to="/" className="inline-flex items-center gap-3 text-[#111111]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00843D] text-white shadow-[0_14px_24px_rgba(10,143,47,0.16)]">
                <School2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#111111]">
                  YabaTech Project
                </p>
                <p className="text-2xl font-black">Academic System</p>
              </div>
            </Link>

            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-[#d7ec9d] bg-[#eff9d6] px-4 py-2 text-sm font-semibold text-[#315214]">
                Account recovery
              </p>
              <h1 className="max-w-2xl text-4xl font-black leading-tight text-[#111111] sm:text-5xl">
                Reset access without stress.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#4f4f4f]">
                Enter your school email and we will send secure reset instructions so you can get
                back into your dashboard.
              </p>
            </div>
          </section>

          <Card className="w-full max-w-[520px] justify-self-center border-[#dfe8d8] bg-white shadow-[0_30px_70px_rgba(0,132,61,0.10)] lg:max-w-none">
            <CardHeader className="space-y-3 border-b border-[#eef2ea] bg-[#fcfffb] px-5 py-6 sm:px-6">
              <CardTitle className="flex items-center gap-3 text-3xl font-black text-[#111111]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff9d6] text-[#00843D]">
                  <MailCheck className="h-5 w-5" />
                </span>
                Forgot Password
              </CardTitle>
              <CardDescription className="text-base leading-7 text-[#4f4f4f]">
                We will email a reset link to the address attached to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-5 py-6 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-[#1e1e1e]">
                    School Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="student@yabatech.local"
                    className="h-11 border-[#E8F5EE] bg-white text-[#111111] placeholder:text-[#4B5563] focus-visible:border-[#FFD600] focus-visible:ring-[#FFD600]/40"
                    disabled={pending}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-[#00843D] text-white shadow-[0_18px_30px_rgba(0,132,61,0.18)] hover:bg-[#006B31]"
                  disabled={pending}
                >
                  {pending ? "Sending reset link..." : "Send Reset Link"}
                </Button>
              </form>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#00843D] transition hover:text-[#006B31]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
