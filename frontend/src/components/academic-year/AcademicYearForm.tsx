import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { CustomInput } from "@/components/global/CustomInput";
import { api } from "@/lib/api";
import { formSchema, type FormValues } from "./schema";
import type { academicYear } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: academicYear | null;
  onSuccess: () => void;
}

const AcademicYearForm = ({ open, onOpenChange, initialData, onSuccess }: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isCurrent: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        fromYear: new Date(initialData.fromYear),
        toYear: new Date(initialData.toYear),
        isCurrent: initialData.isCurrent,
      });
    } else {
      form.reset({
        name: "",
        fromYear: undefined,
        toYear: undefined,
        isCurrent: false,
      });
    }
  }, [initialData, form, open]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (initialData) {
        await api.patch(`/academic-years/update/${initialData._id}`, data);
        toast.success("Academic year updated");
      } else {
        await api.post("/academic-years/create", data);
        toast.success("Academic year created");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to save academic year");
    }
  };

  const pending = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#E8F5EE] bg-white p-0 shadow-[0_30px_70px_rgba(0,132,61,0.10)] sm:max-w-2xl">
        <DialogHeader className="border-b border-[#E8F5EE] bg-[#E8F5EE] px-6 py-5 text-left">
          <DialogTitle className="text-2xl font-black text-[#111111]">
            {initialData ? "Edit Year" : "New Academic Year"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#4B5563]">
            Set the duration for this session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
          <FieldGroup className="space-y-5">
            <CustomInput
              control={form.control}
              name="name"
              label="Year Name"
              placeholder="2026"
              disabled={pending}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="fromYear"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Start Date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start rounded-xl border-[#E8F5EE] bg-white pl-3 text-left font-normal text-[#111111]",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto border-[#E8F5EE] p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} autoFocus />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="toYear"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>End Date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start rounded-xl border-[#E8F5EE] bg-white pl-3 text-left font-normal text-[#111111]",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto border-[#E8F5EE] p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < form.getValues("fromYear")}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="isCurrent"
              control={form.control}
              render={({ field: { value, onChange, ...field } }) => (
                <Field>
                  <div className="flex gap-3 rounded-2xl border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                    <Checkbox id="isCurrent" checked={value} onCheckedChange={onChange} {...field} />
                    <div className="space-y-1 leading-none">
                      <FieldLabel htmlFor="isCurrent" className="cursor-pointer">
                        Set as Active
                      </FieldLabel>
                      <p className="mt-1 text-[0.8rem] text-muted-foreground">
                        Automatically deactivates others.
                      </p>
                    </div>
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="border-t border-[#E8F5EE] pt-5">
            <Button type="submit" disabled={pending} className="w-full rounded-full sm:w-auto sm:min-w-40">
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AcademicYearForm;
