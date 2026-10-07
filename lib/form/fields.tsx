"use client";

import { createFormHookContexts } from "@tanstack/react-form";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker, DateTimePicker } from "@/components/ui/date-picker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

type BaseProps = { label: string; description?: ReactNode; className?: string };

/** Errors can be strings (field validators) or Standard Schema issues (zod form validators). */
function useFieldErrors() {
  const field = useFieldContext<unknown>();
  const { errors, isTouched } = field.state.meta;
  const showErrors = isTouched || field.form.state.submissionAttempts > 0;
  const normalized = showErrors
    ? errors.map((error) => ({
        message: typeof error === "string" ? error : (error as { message?: string })?.message,
      }))
    : [];
  return { field, errors: normalized, invalid: normalized.length > 0 };
}

function FieldShell({
  label,
  description,
  className,
  children,
  orientation = "vertical",
}: BaseProps & { children: ReactNode; orientation?: "vertical" | "horizontal" }) {
  const { field, errors, invalid } = useFieldErrors();
  return (
    <Field data-invalid={invalid} orientation={orientation} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}

export function TextField({
  type = "text",
  placeholder,
  ...props
}: BaseProps & { type?: "text" | "email" | "password" | "url"; placeholder?: string }) {
  const field = useFieldContext<string>();
  return (
    <FieldShell {...props}>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={field.state.meta.errors.length > 0}
      />
    </FieldShell>
  );
}

/** Empty input => `undefined` (so optional numbers can be cleared). */
export function NumberField({
  min,
  max,
  step,
  placeholder,
  ...props
}: BaseProps & { min?: number; max?: number; step?: number; placeholder?: string }) {
  const field = useFieldContext<number | undefined>();
  return (
    <FieldShell {...props}>
      <Input
        id={field.name}
        name={field.name}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
        }
        aria-invalid={field.state.meta.errors.length > 0}
      />
    </FieldShell>
  );
}

export function TextareaField({
  placeholder,
  rows = 4,
  ...props
}: BaseProps & { placeholder?: string; rows?: number }) {
  const field = useFieldContext<string | undefined>();
  return (
    <FieldShell {...props}>
      <Textarea
        id={field.name}
        name={field.name}
        rows={rows}
        placeholder={placeholder}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={field.state.meta.errors.length > 0}
      />
    </FieldShell>
  );
}

export type Option<T extends string = string> = { value: T; label: string };

export function SelectField({
  options,
  placeholder = "Sélectionner",
  ...props
}: BaseProps & { options: readonly Option[]; placeholder?: string }) {
  const field = useFieldContext<string | undefined>();
  return (
    <FieldShell {...props}>
      <Select
        name={field.name}
        value={field.state.value ?? ""}
        onValueChange={(value) => field.handleChange(value)}
      >
        <SelectTrigger id={field.name} onBlur={field.handleBlur} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

export function CheckboxField(props: BaseProps) {
  const field = useFieldContext<boolean>();
  return (
    <FieldShell {...props} orientation="horizontal">
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
        onBlur={field.handleBlur}
      />
    </FieldShell>
  );
}

export function DateField({ withTime = false, ...props }: BaseProps & { withTime?: boolean }) {
  const field = useFieldContext<Date | undefined>();
  return (
    <FieldShell {...props}>
      {withTime ? (
        <DateTimePicker value={field.state.value} onChange={(date) => field.handleChange(date)} />
      ) : (
        <DatePicker date={field.state.value} onSelect={(date) => field.handleChange(date)} />
      )}
    </FieldShell>
  );
}

export function SubmitButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
      {([canSubmit, isSubmitting]) => (
        <Button type="submit" disabled={!canSubmit || isSubmitting} className={className}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}
