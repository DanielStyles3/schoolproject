import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CustomInput } from "@/components/global/CustomInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import PageShell from "@/components/global/PageShell";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, setUser } = useAuth();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
    });
  }, [form, user?.email, user?.name]);

  const pending = form.formState.isSubmitting;

  const onSubmit = async (values: ProfileValues) => {
    try {
      const response = await api.put("/users/profile", values);
      if (response.data?.user) {
        setUser(response.data.user);
      }
      form.reset({ ...values, password: "" });
      toast.success(response.data?.message || "Profile updated successfully.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update your profile right now.";
      toast.error(message);
    }
  };

  return (
    <PageShell
      title="My Profile"
      description="Keep your personal details current and set a new password whenever you need one."
    >

      <Card className="gap-0 overflow-hidden border-border bg-card py-0 shadow-sm">
        <CardHeader className="space-y-3 border-b border-border bg-surface-muted">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-foreground">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Update your details
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-muted-foreground">
            Your role stays the same here. This page is only for your own account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 py-6 sm:px-6">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-5">
              <CustomInput
                control={form.control}
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                disabled={pending}
              />
              <CustomInput
                control={form.control}
                name="email"
                label="Email Address"
                type="email"
                placeholder="student@yabatech.local"
                disabled={pending}
              />
              <CustomInput
                control={form.control}
                name="password"
                label="New Password"
                type="password"
                placeholder="Leave blank to keep your current password"
                disabled={pending}
                description="Optional. Only fill this if you want to change your password."
              />
              <Button
                type="submit"
                className="h-11 bg-primary px-6 text-primary-foreground hover:bg-primary-hover"
                disabled={pending}
              >
                <Save className="mr-2 h-4 w-4" />
                {pending ? "Saving changes..." : "Save Changes"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default Profile;
