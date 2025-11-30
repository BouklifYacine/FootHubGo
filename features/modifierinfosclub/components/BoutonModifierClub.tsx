"use client";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useModifierInfosClub } from "@/features/modifierinfosclub/hooks/useModifierInfosClub";
import { useState } from "react";
import { SchemaModifierInfosClub } from "../schemas/SchemaModifierInfosClub";
import z from "zod";
import { InfosClubApiResponse } from "@/features/club/hooks/useinfosclub";
import { getFormattedNiveauOptions } from "@/lib/formatEnums";

type FormData = z.infer<typeof SchemaModifierInfosClub>;

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideButton?: boolean;
  clubData: InfosClubApiResponse | undefined;
}

function BoutonModifierClub({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  hideButton = false,
  clubData,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { mutate, isPending } = useModifierInfosClub();

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const niveauOptions = getFormattedNiveauOptions();

  const form = useForm({
    defaultValues: {
      nom: clubData?.equipe.nom || "",
      description: clubData?.equipe.description || "",
      niveau: clubData?.equipe.niveau || "LOISIR",
    } as FormData,
    onSubmit: async ({ value }) => {
      if (!clubData?.equipe.id) return;

      const result = SchemaModifierInfosClub.safeParse(value);
      if (!result.success) {
        console.error("Erreur de validation:", result.error);
        return;
      }

      mutate(
        { clubId: clubData.equipe.id, clubData: result.data },
        {
          onSuccess: () => {
            setOpen(false);
          },
        }
      );
    },
  });

  if (!clubData || !clubData.equipe) {
    return <p>Chargement ou accès non autorisé...</p>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideButton && (
        <DialogTrigger asChild>
          <Button className="rounded-xl border border-white cursor-pointer">
            <Pencil size={16} />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier les informations du club</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de votre club.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="nom"
            validators={{
              onChange: ({ value }) => {
                const result = SchemaModifierInfosClub.shape.nom.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="nom">Nom du club</Label>
                <Input
                  id="nom"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Nom du club"
                  className={
                    field.state.meta.errors.length > 0 ? "border-red-500" : ""
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="niveau"
            validators={{
              onChange: ({ value }) => {
                const result = SchemaModifierInfosClub.shape.niveau.safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="niveau">Niveau</Label>
                <Select
                  onValueChange={(value) =>
                    field.handleChange(value as FormData["niveau"])
                  }
                  value={field.state.value}
                >
                  <SelectTrigger
                    id="niveau"
                    className={
                      field.state.meta.errors.length > 0 ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Sélectionner un niveau" />
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
                  <p className="text-red-500 text-sm mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="description"
            validators={{
              onChange: ({ value }) => {
                const result = SchemaModifierInfosClub.shape.description.safeParse(
                  value
                );
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Description"
                  className={
                    field.state.meta.errors.length > 0 ? "border-red-500" : ""
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isPending}>
                  {isPending || isSubmitting
                    ? "Enregistrement..."
                    : "Enregistrer"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { BoutonModifierClub };
