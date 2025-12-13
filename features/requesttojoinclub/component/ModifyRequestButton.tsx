"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Pencil, Loader2 } from "lucide-react";
import { PosteJoueur, NiveauClub } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { requesttojoinclubSchema } from "@/features/requesttojoinclub/schema/requesttojoinclubschema";
import { cn } from "@/lib/utils";
import { useUpdateRequestToAClub } from "../hooks/useUpdateRequestToAClub";
import {
  getFormattedNiveauOptions,
  getFormattedPosteOptions,
} from "@/lib/formatEnums";

const validatePoste = ({ value }: { value: unknown }) => {
  const result = requesttojoinclubSchema.shape.poste.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
};

const validateNiveau = ({ value }: { value: unknown }) => {
  const result = requesttojoinclubSchema.shape.niveau.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
};

const validateMotivation = ({ value }: { value: string }) => {
  const result = requesttojoinclubSchema.shape.motivation.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
};

type Props = {
  requestId: string;
  teamId: string;
  currentPoste: PosteJoueur;
  currentNiveau: NiveauClub;
  currentMotivation: string;
};

export default function ModifyRequestButton({
  requestId,
  teamId,
  currentPoste,
  currentNiveau,
  currentMotivation,
}: Props) {
  const [open, setOpen] = useState(false);
  const mutation = useUpdateRequestToAClub();

  const posteOptions = getFormattedPosteOptions();
  const niveauOptions = getFormattedNiveauOptions();

  const form = useForm({
    defaultValues: {
      poste: currentPoste,
      niveau: currentNiveau,
      motivation: currentMotivation,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        requestId,
        teamId,
        data: value,
      });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className="cursor-pointer gap-2 py-2.5"
          onSelect={(e) => e.preventDefault()}
        >
          <Pencil size={16} className="text-zinc-500" />
          <span className="font-medium">Modifier la demande</span>
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border-none shadow-2xl dark:bg-zinc-950/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="px-6 py-6 border-b dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-primary">
              Modifier la demande
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Modifiez votre candidature avant qu'elle ne soit traitée.
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
            <form.Field name="poste" validators={{ onChange: validatePoste }}>
              {(field) => (
                <div className="space-y-2 group">
                  <Label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors flex items-center gap-2">
                    Poste souhaité *
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as PosteJoueur)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary/20 transition-all",
                        field.state.meta.errors.length &&
                          "border-red-500 focus:ring-red-500/20"
                      )}
                    >
                      <SelectValue placeholder="Sélectionnez votre poste" />
                    </SelectTrigger>
                    <SelectContent>
                      {posteOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="niveau" validators={{ onChange: validateNiveau }}>
              {(field) => (
                <div className="space-y-2 group">
                  <Label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors flex items-center gap-2">
                    Votre niveau estimé *
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as NiveauClub)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary/20 transition-all",
                        field.state.meta.errors.length &&
                          "border-red-500 focus:ring-red-500/20"
                      )}
                    >
                      <SelectValue placeholder="Sélectionnez votre niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {niveauOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="motivation"
              validators={{ onChange: validateMotivation }}
            >
              {(field) => (
                <div className="space-y-2 group">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors flex items-center gap-2"
                  >
                    Motivation *
                  </Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Pourquoi voulez-vous rejoindre ce club ?"
                    className={cn(
                      "min-h-[120px] resize-none bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40",
                      field.state.meta.errors.length &&
                        "border-red-500 focus:ring-red-500/20"
                    )}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4 border-t dark:border-zinc-800 mt-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-5 text-sm font-medium border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Annuler
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="h-10 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Modification...
                  </span>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
