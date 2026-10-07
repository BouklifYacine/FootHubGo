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

    ModifierStatsEquipeSchema,
  SchemaModificationStatsEquipe,
} from "@/features/stats/statsequipe/schema/ModifierStatsEquipeSchema";
import { useModifierStatsEquipe } from "@/features/stats/statsequipe/hooks/useModifierStatsEquipe";
import { StatistiqueEquipe } from "@/generated/prisma/browser";

const enumsResultat = ["VICTOIRE", "DEFAITE", "NUL"] as const;
const enumsCompetition = ["CHAMPIONNAT", "COUPE"] as const;

interface Props {
  eventid: string;
  statsEquipe: StatistiqueEquipe;
}

// Équivalent de `valueAsNumber` : champ vide => NaN (rejeté par le schéma)
const numberInputValue = (value: number | undefined) =>
  value === undefined || Number.isNaN(value) ? "" : value;

export function BoutonModifierStatsEquipe({ eventid, statsEquipe }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useModifierStatsEquipe();

  const defaultValues: SchemaModificationStatsEquipe = {
    resultatMatch: statsEquipe.resultatMatch,
    butsMarques: statsEquipe.butsMarques,
    butsEncaisses: statsEquipe.butsEncaisses,
    cleanSheet: statsEquipe.cleanSheet,
    domicile: statsEquipe.domicile,
    competition: statsEquipe.competition,
    tirsTotal: statsEquipe.tirsTotal ?? undefined,
    tirsCadres: statsEquipe.tirsCadres ?? undefined,
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: ModifierStatsEquipeSchema,
    },
    onSubmit: ({ value }) => {
      const data = ModifierStatsEquipeSchema.parse(value);
      mutate(
        {
          eventId: eventid,
          statsEquipeId: statsEquipe.id,
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
        resultatMatch: statsEquipe.resultatMatch,
        butsMarques: statsEquipe.butsMarques,
        butsEncaisses: statsEquipe.butsEncaisses,
        cleanSheet: statsEquipe.cleanSheet,
        domicile: statsEquipe.domicile,
        competition: statsEquipe.competition,
        tirsTotal: statsEquipe.tirsTotal ?? undefined,
        tirsCadres: statsEquipe.tirsCadres ?? undefined,
      });
    }
  }}
>
      <DialogTrigger asChild>
        <Button
          className=" text-center cursor-pointer"
        > Modifier stats
          <Pencil size={16} strokeWidth={2} />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier les statistiques d&apos;équipe</DialogTitle>
          <DialogDescription>
            Ajustez les informations sur la performance de votre équipe
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

          <form.Field name="resultatMatch">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="resultatMatch">Résultat du match *</Label>
                  <Select
                    onValueChange={(value) =>
                      field.handleChange(value as SchemaModificationStatsEquipe["resultatMatch"])
                    }
                    value={field.state.value}
                  >
                    <SelectTrigger
                      id="resultatMatch"
                      className={error ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Sélectionnez un résultat" />
                    </SelectTrigger>
                    <SelectContent>
                      {enumsResultat.map((resultat) => (
                        <SelectItem key={resultat} value={resultat}>
                          {resultat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="butsMarques">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="butsMarques">Buts marqués *</Label>
                  <Input
                    id="butsMarques"
                    type="number"
                    name={field.name}
                    value={numberInputValue(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="butsEncaisses">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="butsEncaisses">Buts encaissés *</Label>
                  <Input
                    id="butsEncaisses"
                    type="number"
                    name={field.name}
                    value={numberInputValue(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="cleanSheet">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cleanSheet"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                />
                <Label htmlFor="cleanSheet">Clean sheet</Label>
              </div>
            )}
          </form.Field>

          <form.Field name="domicile">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="domicile"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                />
                <Label htmlFor="domicile">Match à domicile</Label>
              </div>
            )}
          </form.Field>

          <form.Field name="tirsTotal">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="tirsTotal">Tirs totaux</Label>
                  <Input
                    id="tirsTotal"
                    type="number"
                    name={field.name}
                    value={numberInputValue(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="tirsCadres">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="tirsCadres">Tirs cadrés</Label>
                  <Input
                    id="tirsCadres"
                    type="number"
                    name={field.name}
                    value={numberInputValue(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="competition">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="competition">Compétition *</Label>
                  <Select
                    onValueChange={(value) =>
                      field.handleChange(value as SchemaModificationStatsEquipe["competition"])
                    }
                    value={field.state.value}
                  >
                    <SelectTrigger
                      id="competition"
                      className={error ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Sélectionnez une compétition" />
                    </SelectTrigger>
                    <SelectContent>
                      {enumsCompetition.map((competition) => (
                        <SelectItem key={competition} value={competition}>
                          {competition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer les stats"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
