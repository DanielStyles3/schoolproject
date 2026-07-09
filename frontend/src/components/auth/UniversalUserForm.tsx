import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";

import {
  type Class,
  type UserRole,
  type pagination,
  type subject,
  type user,
} from "@/types";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/global/CustomInput";
import { api } from "@/lib/api";
import { CustomSelect } from "@/components/global/CustomSelect";
import { useEffect, useState, useCallback } from "react";
import { CustomMultiSelect } from "@/components/global/CustomMultiSelect";

export type FormType = "login" | "create" | "update";
interface Props {
  type: FormType;
  initialData?: user | null;
  onSuccess?: () => void;
  role?: UserRole;
}

const createSchema = (type: FormType) => {
  return z
    .object({
      name:
        type === "login"
          ? z.string().optional()
          : z.string().min(2, "Name is required"),
      classId: z.string().optional(),
      subjectIds: z.array(z.string()).optional(),
      email: z.email("Invalid email address"),
      role: z.string().optional(),
      password:
        type === "update"
          ? z
              .string()
              .optional()
              .refine((val) => !val || val.length >= 6, {
                message: "Password must be at least 6 characters",
              })
          : z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword:
        type === "create"
          ? z.string().min(8, {
              message: "Password must be at least 8 characters.",
            })
          : z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (type === "create" && data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match",
          path: ["confirmPassword"],
        });
      }
    });
};

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const UniversalUserForm = ({ type, initialData, onSuccess, role }: Props) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const isUpdate = type === "update";
  const isLogin = type === "login";

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [subjects, setSubjects] = useState<subject[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(type)),
    defaultValues: {
      name: "",
      email: "",
      role: role,
      password: "",
      classId: undefined,
      subjectIds: [],
    },
  });

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = (await api.get("/classes")) as {
        data: { classes: Class[]; pagination: pagination };
      };
      setClasses(data.classes);
    } catch {
      if (type !== "login") {
        toast.error("Failed to load Classes");
      }
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const { data } = (await api.get("/courses")) as {
        data: { subjects: subject[]; pagination: pagination };
      };
      setSubjects(data.subjects);
      setLoadingOptions(false);
    } catch {
      if (type !== "login") {
        toast.error("Failed to load courses");
      }
    } finally {
      setLoadingOptions(false);
    }
  }, [type]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    if (initialData && isUpdate) {
      const existingClassId =
        typeof initialData.studentClass === "object"
          ? initialData.studentClass?._id
          : initialData.studentClass;

      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "student",
        password: "",
        classId: existingClassId || "",
        subjectIds: initialData.teacherSubjects?.map((s) => s._id) || [],
      });
    }
  }, [isUpdate, initialData, form, classes]);

  async function onSubmit(data: FormValues) {
    try {
      const payload = {
        studentClass: data.classId ? data.classId : undefined,
        teacherSubjects: data.subjectIds ? data.subjectIds : [],
        ...data,
      };
      if (isLogin) {
        const { data: responseData } = await api.post("/users/login", {
          email: data.email,
          password: data.password,
        });
        setUser(responseData.user);
        toast.success("Logged in successfully");
        navigate("/dashboard");
      } else if (type === "create") {
        await api.post("/users/register", payload);
        toast.success("Account created successfully!");
        if (onSuccess) onSuccess();
      } else if (type === "update" && initialData?._id) {
        await api.put(`/users/update/${initialData._id}`, payload);
        toast.success("User updated successfully");
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred. Please try again.";
      toast.error(message);
    }
  }

  const classOptions = Array.isArray(classes)
    ? classes.map((c) => ({
        label: c.name,
        value: c._id,
      }))
    : [];
  const subjectOptions = Array.isArray(subjects)
    ? subjects.map((s) => ({ label: s.name, value: s._id }))
    : [];
  const roleOptions = role ? [{ label: role, value: role }] : [];

  const pending = form.formState.isSubmitting;
  const showRoleSelector = !isLogin;
  const showClassSelector = !isLogin && role === "student";
  const showSubjectSelector = !isLogin && role === "teacher";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
      <FieldGroup className="space-y-4 sm:space-y-5">
        <div className="grid w-full gap-4 sm:grid-cols-2">
          {!isLogin && (
            <CustomInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="Jane Doe"
              disabled={pending}
            />
          )}
          {showRoleSelector && (
            <CustomSelect
              control={form.control}
              name="role"
              label="Role"
              placeholder="Select role"
              options={roleOptions}
              disabled={pending}
            />
          )}
          <div className="space-y-4 sm:col-span-2">
            {showClassSelector && (
              <CustomSelect
                control={form.control}
                name="classId"
                label="Class"
                placeholder="Select Class"
                options={classOptions}
                disabled={pending}
                loading={loading}
              />
            )}
            {showSubjectSelector && (
              <CustomMultiSelect
                control={form.control}
                name="subjectIds"
                label="Courses"
                placeholder="Select courses..."
                options={subjectOptions}
                loading={loadingOptions}
                disabled={pending}
              />
            )}
            <CustomInput
              control={form.control}
              name="email"
              label="Email Address"
              type="email"
              placeholder="m@example.com"
              disabled={pending}
            />
          </div>
          <div className="sm:col-span-2">
            <CustomInput
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder={isUpdate ? "New Password (Optional)" : "Password"}
              disabled={pending}
            />
          </div>
          {type === "create" && (
            <div className="sm:col-span-2">
              <CustomInput
                control={form.control}
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder={"Confirm Password"}
                disabled={pending}
              />
            </div>
          )}
          <div className="mt-2 sm:col-span-2">
            <Button type="submit" className="w-full rounded-full" disabled={pending}>
              {pending
                ? "Processing..."
                : type === "login"
                ? "Sign In"
                : type === "create"
                ? "Create Account"
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
};

export default UniversalUserForm;


