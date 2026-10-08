"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/lib/form/fields";

/** Password input with a show / hide toggle. */
export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className="pr-12" {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}

/**
 * `useAppForm` field for passwords (same layout as `TextField`):
 * <form.AppField name="password">{() => <PasswordField label="Mot de passe" />}</form.AppField>
 */
export function PasswordField({
  label,
  placeholder,
  autoComplete = "new-password",
}: {
  label: string;
  placeholder?: string;
  autoComplete?: "current-password" | "new-password";
}) {
  const field = useFieldContext<string>();
  const { errors, isTouched } = field.state.meta;
  const visibleErrors = isTouched || field.form.state.submissionAttempts > 0 ? errors : [];
  const messages = visibleErrors.map((error) => ({
    message: typeof error === "string" ? error : (error as { message?: string })?.message,
  }));

  return (
    <Field data-invalid={messages.length > 0}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <PasswordInput
        id={field.name}
        name={field.name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={messages.length > 0}
      />
      <FieldError errors={messages} />
    </Field>
  );
}
