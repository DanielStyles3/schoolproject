import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { LogIn } from "lucide-react";

import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { CustomInput } from "@/components/global/CustomInput";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const demoAccounts = [
  { label: "Admin", email: "admin@yabatech.local", password: "ChangeMe123!" },
  { label: "Teacher", email: "teacher@yabatech.local", password: "ChangeMe123!" },
  { label: "Student", email: "student@yabatech.local", password: "ChangeMe123!" },
];

type LoginValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const pending = form.formState.isSubmitting;

  const fillDemoAccount = (account: (typeof demoAccounts)[number]) => {
    form.setValue("email", account.email, { shouldValidate: true });
    form.setValue("password", account.password, { shouldValidate: true });
  };

  const onSubmit = async (values: LoginValues) => {
    try {
      await api.post("/users/login", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      await refreshAuth();
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to sign in right now.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="space-y-4">
        <CustomInput
          control={form.control}
          name="email"
          label="School Email"
          type="email"
          placeholder="student@yabatech.local"
          disabled={pending}
        />
        <div className="space-y-2">
          <CustomInput
            control={form.control}
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            disabled={pending}
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-semibold text-primary transition hover:text-primary-hover">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-muted p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Demo login</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemoAccount(account)}
                disabled={pending}
                className="rounded-full border border-border bg-card px-3 py-2 text-sm font-bold text-foreground transition hover:border-accent hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover"
          disabled={pending}
        >
          <LogIn className="mr-2 h-4 w-4" />
          {pending ? "Signing in..." : "Sign In"}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
