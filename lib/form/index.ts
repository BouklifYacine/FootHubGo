"use client";

import { createFormHook } from "@tanstack/react-form";
import {
  CheckboxField,
  DateField,
  fieldContext,
  formContext,
  NumberField,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "./fields";

/**
 * App-wide form hook. Fields render label + control + error in one line:
 *
 * const form = useAppForm({
 *   defaultValues,
 *   validators: { onSubmit: injurySchema },
 *   onSubmit: ({ value }) => mutation.mutateAsync(value),
 * });
 *
 * <form.AppField name="type">{(f) => <f.TextField label="Type de blessure" />}</form.AppField>
 * <form.AppForm><form.SubmitButton>Enregistrer</form.SubmitButton></form.AppForm>
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, NumberField, TextareaField, SelectField, CheckboxField, DateField },
  formComponents: { SubmitButton },
});

export type { Option } from "./fields";
