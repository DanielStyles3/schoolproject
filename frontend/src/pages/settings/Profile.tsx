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
    <div className="space-y-6 bg-[linear-gradient(180deg,#f7fff4_0%,#ffffff_100%)] p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#111111]">
          Account settings
        </p>
        <h1 className="text-3xl font-black text-[#111111]">My Profile</h1>
        <p className="max-w-2xl text-sm leading-7 text-[#4f4f4f] sm:text-base">
          Keep your personal details current and set a new password whenever you need a quick
          security refresh.
        </p>
      </div>

      <Card className="border-[#dfe8d8] bg-white shadow-[0_26px_60px_rgba(0,132,61,0.08)]">
        <CardHeader className="space-y-3 border-b border-[#eef2ea] bg-[#fcfffb]">
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-[#111111]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff9d6] text-[#00843D]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Update your details
          </CardTitle>
          <CardDescription className="text-sm leading-7 text-[#4f4f4f] sm:text-base">
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
                className="h-11 rounded-xl bg-[#00843D] px-6 text-white shadow-[0_18px_30px_rgba(0,132,61,0.18)] hover:bg-[#006B31]"
                disabled={pending}
              >
                <Save className="mr-2 h-4 w-4" />
                {pending ? "Saving changes..." : "Save Changes"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
