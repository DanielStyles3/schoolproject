import { useEffect, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { subjectFormSchema, type SubjectFormValues } from "./schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomInput } from "@/components/global/CustomInput";
import { CustomMultiSelect } from "@/components/global/CustomMultiSelect";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { Class, subject } from "@/types";
import Modal from "@/components/global/Modal";

interface Option {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: subject | null;
  onSuccess: () => void;
}

export function SubjectForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: Props) {
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchOptions = async () => {
      setLoadingOptions(true);
      setLoadingClasses(true);
      try {
        const [teachersRes, classesRes] = await Promise.all([
          api.get("/users?role=teacher"),
          api.get("/classes?limit=100"),
        ]);
        setTeachers(teachersRes.data.users || []);
        setClasses(classesRes.data.classes || []);
      } catch {
        toast.error("Failed to load course options");
      } finally {
        setLoadingOptions(false);
        setLoadingClasses(false);
      }
    };

    fetchOptions();
  }, [open]);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema) as Resolver<SubjectFormValues>,
    defaultValues: {
      name: "",
      code: "",
      unit: 3,
      teacher: [],
      classIds: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      const teacherIds = initialData.teacher
        ? initialData.teacher.map((t) => (typeof t === "object" ? t._id : t))
        : [];
      const linkedClassIds = classes
        .filter((classItem) => (classItem.subjects || []).some((item) => item._id === initialData._id))
        .map((classItem) => classItem._id);

      form.reset({
        name: initialData.name || "",
        code: initialData.code || "",
        unit: initialData.unit || 3,
        teacher: teacherIds,
        classIds: linkedClassIds,
        isActive: initialData.isActive ?? true,
      });
      return;
    }

    form.reset({
      name: "",
      code: "",
      unit: 3,
      teacher: [],
      classIds: [],
      isActive: true,
    });
  }, [classes, form, initialData, open]);

  const onSubmit = async (values: SubjectFormValues) => {
    try {
      const payload = {
        ...values,
        teacher:
          !values.teacher || values.teacher.length === 0
            ? null
            : values.teacher,
        classIds: values.classIds || [],
      };

      if (initialData) {
        await api.patch(`/courses/update/${initialData._id}`, payload);
        toast.success("Course updated successfully");
      } else {
        await api.post("/courses/create", payload);
        toast.success("Course created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || "Operation failed";
      toast.error(typeof msg === "string" ? msg : "Error occurred");
    }
  };

  const teachersOptions = teachers.map((teacher) => ({
    label: teacher.name,
    value: teacher._id,
  }));
  const classOptions = classes.map((classItem) => ({
    label: classItem.name,
    value: classItem._id,
  }));

  return (
    <Modal
      title={initialData ? "Edit Course" : "Create Course"}
      description={
        initialData
          ? "Edit the course details and choose the classes that should see it."
          : "Fill in the details and choose the classes that should see this course on the student portal."
      }
      open={open}
      setOpen={onOpenChange}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <CustomInput
              control={form.control}
              name="name"
              label="Name"
              placeholder="Mathematics"
              disabled={form.formState.isSubmitting}
            />
            <CustomInput
              control={form.control}
              name="code"
              label="Code"
              placeholder="MATH-101"
              disabled={form.formState.isSubmitting}
            />
          </div>
          <CustomInput
            control={form.control}
            name="unit"
            label="Course Unit"
            type="number"
            placeholder="3"
            disabled={form.formState.isSubmitting}
          />
          <CustomMultiSelect
            control={form.control}
            name="teacher"
            label="Teacher"
            placeholder="Select teacher..."
            options={teachersOptions}
            loading={loadingOptions}
            disabled={form.formState.isSubmitting}
          />
          <CustomMultiSelect
            control={form.control}
            name="classIds"
            label="Classes To Show This Course"
            placeholder="Select classes..."
            options={classOptions}
            loading={loadingClasses}
            disabled={form.formState.isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Students will only see this course if their class is selected here.
          </p>
          <Controller
            name="isActive"
            control={form.control}
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex flex-row space-x-3 rounded-xl border border-border bg-surface-muted p-4">
                  <Checkbox
                    id="isActive"
                    checked={value}
                    onCheckedChange={onChange}
                    {...field}
                  />
                  <div className="space-y-1">
                    <FieldLabel
                      htmlFor="isActive"
                      className="cursor-pointer mb-0"
                    >
                      Active Course
                    </FieldLabel>
                    <p className="text-xs text-muted-foreground">
                      Inactive courses will not appear during registration.
                    </p>
                  </div>
                </div>
              </Field>
            )}
          />
        </FieldGroup>
        <Button
          type="submit"
          className="w-full mt-4"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Course"}
        </Button>
      </form>
    </Modal>
  );
}
