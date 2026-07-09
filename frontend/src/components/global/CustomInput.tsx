import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface CustomInputProps<T extends FieldValues>
  extends Omit<ComponentProps<typeof Input>, "name"> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
}

export function CustomInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  ...props
}: CustomInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="w-full">
          <FieldLabel className="text-[#111111]">{label}</FieldLabel>
          <Input
            {...field}
            {...props}
            disabled={disabled}
            className={cn(
              "h-11 w-full rounded-xl border-[#E8F5EE] bg-white text-sm text-[#111111] shadow-sm placeholder:text-[#4B5563]/70 focus-visible:border-[#00843D] focus-visible:ring-[#00843D]/20",
              className,
            )}
          />

          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}