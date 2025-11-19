"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { useForm } from "@tanstack/react-form";
import { useCreateInjury } from "@/features/injuries/hooks/UseCreateInjury";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Activity, FileText, AlertCircle } from "lucide-react";
import { createInjurySchema } from "@/features/injuries/schema/createinjuryschema";
import { cn } from "@/lib/utils";

const validateType = ({ value }: { value: string }) => {
  const result = createInjurySchema.shape.type.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
};

const validateDescription = ({ value }: { value: string }) => {
  const result = createInjurySchema.shape.description.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
};

const validateEndDate = ({ value }: { value: Date }) => {
  const result = createInjurySchema.shape.endDate.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
};

const typeValidators = {
  onChange: validateType,
  onBlur: validateType,
};

const descriptionValidators = {
  onChange: validateDescription,
  onBlur: validateDescription,
};

const endDateValidators = {
  onChange: validateEndDate,
  onBlur: validateEndDate,
};

export const CreateInjuryDialog = () => {
  const createInjury = useCreateInjury();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      type: "",
      description: "",
      endDate: new Date(new Date().setDate(new Date().getDate() + 4)),
    },
    onSubmit: async ({ value }) => {
      try {
        await createInjury.mutateAsync(value);
        setOpen(false);
        form.reset();
      } catch (error) {
        // Error handled by hook
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="group relative overflow-hidden rounded-full bg-primary px-8 py-6 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
          <span className="flex items-center gap-2 font-bold text-base">
            <Plus className="h-5 w-5" />
            Signaler une blessure
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border-none shadow-2xl dark:bg-zinc-950/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="px-6 py-6 border-b dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-primary">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              Nouvelle Blessure
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Remplissez les informations ci-dessous pour informer le staff.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="type"
              validators={typeValidators}
              children={(field) => (
                <div className="space-y-2 group">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors"
                  >
                    Type de blessure
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Ex: Entorse cheville droite"
                      className={cn(
                        "h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40",
                        field.state.meta.errors.length &&
                          "border-red-500 focus:ring-red-500/20"
                      )}
                      required
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            <form.Field
              name="description"
              validators={descriptionValidators}
              children={(field) => (
                <div className="space-y-2 group">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors"
                  >
                    Description détaillée
                  </Label>
                  <div className="relative">
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Expliquez les circonstances et la douleur ressentie..."
                      className={cn(
                        "min-h-[120px] resize-none bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40",
                        field.state.meta.errors.length &&
                          "border-red-500 focus:ring-red-500/20"
                      )}
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            <form.Field
              name="endDate"
              validators={endDateValidators}
              children={(field) => (
                <div className="space-y-2 group">
                  <Label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">
                    Date de retour estimée
                  </Label>
                  <div className="relative">
                    <DatePicker
                      date={field.state.value}
                      onSelect={(date) =>
                        field.handleChange(date || new Date())
                      }
                      className={cn(
                        "w-full h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-2 focus:ring-primary/20 transition-all",
                        field.state.meta.errors.length && "border-red-500"
                      )}
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4 border-t dark:border-zinc-800 mt-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  className="h-11 px-6 cursor-pointer border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-300"
                >
                  Annuler
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={createInjury.isPending}
                className="h-11 px-8 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {createInjury.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </span>
                ) : (
                  "Enregistrer la blessure"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
