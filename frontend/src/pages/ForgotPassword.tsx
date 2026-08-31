import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import BrandLockup from "@/components/global/BrandLockup";

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
    <div className="min-h-svh overflow-x-hidden bg-background">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="hidden space-y-8 lg:block">
            <BrandLockup size="md" />

            <div className="space-y-3">
              <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-foreground">
                Reset your account access
              </h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                Enter your school email and we will send secure reset instructions so you can get
                back into your dashboard.
              </p>
            </div>
          </section>

          <Card className="w-full max-w-[480px] justify-self-center gap-0 overflow-hidden border-border bg-card py-0 shadow-sm lg:max-w-none">
            <CardHeader className="space-y-3 border-b border-border bg-surface-muted px-5 py-6 sm:px-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-foreground">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <MailCheck className="h-5 w-5" />
                </span>
                Forgot Password
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground">
                We will email a reset link to the address attached to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-5 py-6 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    School Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="student@yabatech.local"
                    className="h-11 border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/30"
                    disabled={pending}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary-hover"
                  disabled={pending}
                >
                  {pending ? "Sending reset link..." : "Send Reset Link"}
                </Button>
              </form>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
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
