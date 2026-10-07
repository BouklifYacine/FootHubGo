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
import { Plus } from "lucide-react";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useState } from "react";
import { useCreerStatsEquipe } from "@/features/stats/statsequipe/hooks/useCreerStatsEquipe";

import { Checkbox } from "@/components/ui/checkbox";
import { AjouterStatsEquipeSchema } from "@/features/stats/statsequipe/schema/AjouterStatsEquipeSchema";
import { $Enums } from "@/generated/prisma/browser";

const enumsResultat = ["VICTOIRE", "DEFAITE", "NUL"] as const;
const enumsCompetition = ["CHAMPIONNAT", "COUPE"] as const;

type FormData = z.infer<typeof AjouterStatsEquipeSchema>;
type FormInput = z.input<typeof AjouterStatsEquipeSchema>;
type FormValues = Omit<FormInput, "competition"> & {
  competition: FormInput["competition"] | undefined;
};

interface Props {
  eventid: string;
  typeEvenement :  $Enums.TypeEvenement;
}

function BoutonCreerStatsEquipe({ eventid, typeEvenement }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreerStatsEquipe(eventid);

  function normalizeCompetition(value: $Enums.TypeEvenement): "CHAMPIONNAT" | "COUPE" | undefined {
  if (value === "CHAMPIONNAT" || value === "COUPE") {
    return value;
  }
  return undefined;
}

  const defaultValues: FormValues = {
    butsMarques: 0,
    butsEncaisses: 0,
    resultatMatch: "VICTOIRE",
    cleanSheet: false,
    domicile: true,
    tirsTotal: undefined,
    tirsCadres: undefined,
    competition: normalizeCompetition(typeEvenement),
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: AjouterStatsEquipeSchema,
    },
    onSubmit: ({ value }) => {
      // Parse pour obtenir les valeurs coercées / transformées (nombres)
      const data = AjouterStatsEquipeSchema.parse(value);
      mutate(data, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="aspect-square max-sm:p-0 dark:bg-white text-black border border-gray-400 cursor-pointer"
        >
          <span>{"Ajouter Stats équipe"}</span>
          <Plus
            className="opacity-60 sm:ml-1"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg bg-white dark:bg-black">
        <DialogHeader>
          <DialogTitle>Ajouter des statistiques d&apos;équipe</DialogTitle>
          <DialogDescription>
            Remplissez les informations sur la performance de votre équipe
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
          {/* Résultat du match */}
          <form.Field name="resultatMatch">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="resultatMatch">Résultat du match *</Label>
                  <Select
                    onValueChange={(value) =>
                      field.handleChange(value as FormData["resultatMatch"])
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

          {/* Buts marqués */}
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nombre de buts marqués"
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Buts encaissés */}
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nombre de buts encaissés"
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Clean sheet */}
          <form.Field name="cleanSheet">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cleanSheet"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                    checked={field.state.value}
                  />
                  <Label htmlFor="cleanSheet">Clean sheet</Label>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Domicile */}
          <form.Field name="domicile">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="domicile"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                    checked={field.state.value}
                  />
                  <Label htmlFor="domicile">Match à domicile</Label>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Tirs totaux */}
          <form.Field name="tirsTotal">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="tirsTotal">Tirs totaux</Label>
                  <Input
                    id="tirsTotal"
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nombre total de tirs"
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Tirs cadrés */}
          <form.Field name="tirsCadres">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="tirsCadres">Tirs cadrés</Label>
                  <Input
                    id="tirsCadres"
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nombre de tirs cadrés"
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Compétition */}
          <form.Field name="competition">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="competition">Compétition *</Label>
                  <Select disabled
                    onValueChange={(value) =>
                      field.handleChange(value as FormData["competition"])
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
            <Button
              type="submit"
              className="px-4 py-2 rounded"
              disabled={isPending}
            >
              {isPending ? "Enregistrement..." : "Enregistrer les stats"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { BoutonCreerStatsEquipe };
