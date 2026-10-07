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
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ModifierStatsJoueurSchema,
  TypeModifierStatsJoueurSchema,
} from "@/features/stats/statsjoueur/schema/ModifierStatsJoueurSchema";
import { useModifierStatsJoueur } from "@/features/stats/statsjoueur/hooks/useModifierStatsJoueur";
import { StatsJoueur } from "@/features/evenements/types/TypesEvenements";
import { enumsPoste } from "../schema/AjouterStatsJoueurSchema";

interface Props {
  eventid: string;
  joueur: StatsJoueur;
}

// Équivalent de `valueAsNumber` : champ vide => NaN (rejeté par le schéma)
const numberInputValue = (value: number | undefined) =>
  value === undefined || Number.isNaN(value) ? "" : value;

export function ModalButtonEditPlayerStats({ eventid, joueur }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useModifierStatsJoueur();

  const defaultValues: TypeModifierStatsJoueurSchema = {
    poste: joueur.poste || "GARDIEN",
    buts: joueur.buts,
    passesdecisive: joueur.passesdecisive,
    minutesJouees: joueur.minutesJouees,
    note: joueur.note,
    titulaire: joueur.titulaire,
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: ModifierStatsJoueurSchema,
    },
    onSubmit: ({ value }) => {
      const data = ModifierStatsJoueurSchema.parse(value);
      mutate(
        {
          eventId: eventid,
          joueurid: joueur.idUtilisateur,
          statistiqueid: joueur.id,
          data,
        },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
          },
        }
      );
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          form.reset({
            poste: joueur.poste,
            buts: joueur.buts,
            passesdecisive: joueur.passesdecisive,
            minutesJouees: joueur.minutesJouees,
            note: joueur.note,
            titulaire: joueur.titulaire,
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="Modifier stats joueur"
        >
          <Pencil size={16} strokeWidth={2} />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier les stats de {joueur.nom}</DialogTitle>
          <DialogDescription>
            Ajustez les informations sur la performance du joueur
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
          <form.Field name="poste">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="poste">Poste *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) =>
                      field.handleChange(
                        v as TypeModifierStatsJoueurSchema["poste"]
                      )
                    }
                  >
                    <SelectTrigger
                      id="poste"
                      className={error ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Sélectionnez un poste" />
                    </SelectTrigger>
                    <SelectContent>
                      {enumsPoste.map((poste) => (
                        <SelectItem key={poste} value={poste}>
                          {poste}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="buts">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="buts">Buts*</Label>
                  <Input
                    id="buts"
                    type="number"
                    name={field.name}
                    value={numberInputValue(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="passesdecisive">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="passesdecisive">Passes décisives*</Label>
                  <Input
                    id="passesdecisive"
                    type="number"
                    name={field.name}
                    value={numberInputValue(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="minutesJouees">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="minutesJouees">Minutes jouées*</Label>
                  <Input
                    id="minutesJouees"
                    type="number"
                    name={field.name}
                    value={numberInputValue(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="note">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="note">Note*</Label>
                  <Input
                    id="note"
                    type="number"
                    step="0.1"
                    name={field.name}
                    value={numberInputValue(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="titulaire">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="titulaire"
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                  />
                  <Label htmlFor="titulaire">Titulaire</Label>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer les stats"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
