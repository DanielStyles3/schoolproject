import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  loading?: boolean;
}

export function CustomSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select...",
  options,
  disabled,
  loading = false,
}: CustomSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="w-full">
          <FieldLabel htmlFor={name} className="text-foreground">{label}</FieldLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined} disabled={disabled}>
            <SelectTrigger id={name} className="h-11 w-full rounded-xl border-border bg-card text-left text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:ring-primary/20">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="max-h-72 border-border bg-card text-foreground">
              {loading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
              {!loading && options.length === 0 && <SelectItem value="empty" disabled>No options available</SelectItem>}
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}