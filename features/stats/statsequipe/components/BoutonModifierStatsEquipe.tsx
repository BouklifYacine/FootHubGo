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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {

    ModifierStatsEquipeSchema,
  SchemaModificationStatsEquipe,
} from "@/features/stats/statsequipe/schema/ModifierStatsEquipeSchema";
import { useModifierStatsEquipe } from "@/features/stats/statsequipe/hooks/useModifierStatsEquipe";
import { StatistiqueEquipe } from "@prisma/client";

const enumsResultat = ["VICTOIRE", "DEFAITE", "NUL"] as const;
const enumsCompetition = ["CHAMPIONNAT", "COUPE"] as const;

interface Props {
  eventid: string;
  statsEquipe: StatistiqueEquipe;
}

export function BoutonModifierStatsEquipe({ eventid, statsEquipe }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useModifierStatsEquipe();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SchemaModificationStatsEquipe>({
    resolver: zodResolver(ModifierStatsEquipeSchema),
    defaultValues: {
      resultatMatch: statsEquipe.resultatMatch,
      butsMarques: statsEquipe.butsMarques,
      butsEncaisses: statsEquipe.butsEncaisses,
      cleanSheet: statsEquipe.cleanSheet,
      domicile: statsEquipe.domicile,
      competition: statsEquipe.competition,
      tirsTotal: statsEquipe.tirsTotal ?? undefined,
      tirsCadres: statsEquipe.tirsCadres ?? undefined,
    },
  });

  const onSubmit = (data: SchemaModificationStatsEquipe) => {
    mutate(
      {
        eventId: eventid,
        statsEquipeId: statsEquipe.id,
        data,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      }
    );
  };

  return (
   <Dialog
  open={open}
  onOpenChange={(isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      reset({
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
          <DialogTitle>Modifier les statistiques d'équipe</DialogTitle>
          <DialogDescription>
            Ajustez les informations sur la performance de votre équipe
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <Label htmlFor="resultatMatch">Résultat du match *</Label>
            <Select
              onValueChange={(value) =>
                setValue("resultatMatch", value as SchemaModificationStatsEquipe["resultatMatch"])
              }
              value={watch("resultatMatch")}
            >
              <SelectTrigger
                id="resultatMatch"
                className={errors.resultatMatch ? "border-red-500" : ""}
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
            {errors.resultatMatch && (
              <p className="text-red-500 text-sm mt-1">
                {errors.resultatMatch.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="butsMarques">Buts marqués *</Label>
            <Input
              id="butsMarques"
              type="number"
              {...register("butsMarques", { valueAsNumber: true })}
              className={errors.butsMarques ? "border-red-500" : ""}
            />
            {errors.butsMarques && (
              <p className="text-red-500 text-sm mt-1">
                {errors.butsMarques.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="butsEncaisses">Buts encaissés *</Label>
            <Input
              id="butsEncaisses"
              type="number"
              {...register("butsEncaisses", { valueAsNumber: true })}
              className={errors.butsEncaisses ? "border-red-500" : ""}
            />
            {errors.butsEncaisses && (
              <p className="text-red-500 text-sm mt-1">
                {errors.butsEncaisses.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="cleanSheet"
              checked={watch("cleanSheet")}
              onCheckedChange={(checked) => setValue("cleanSheet", !!checked)}
            />
            <Label htmlFor="cleanSheet">Clean sheet</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="domicile"
              checked={watch("domicile")}
              onCheckedChange={(checked) => setValue("domicile", !!checked)}
            />
            <Label htmlFor="domicile">Match à domicile</Label>
          </div>

          <div>
            <Label htmlFor="tirsTotal">Tirs totaux</Label>
            <Input
              id="tirsTotal"
              type="number"
              {...register("tirsTotal", { valueAsNumber: true })}
              className={errors.tirsTotal ? "border-red-500" : ""}
            />
            {errors.tirsTotal && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tirsTotal.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="tirsCadres">Tirs cadrés</Label>
            <Input
              id="tirsCadres"
              type="number"
              {...register("tirsCadres", { valueAsNumber: true })}
              className={errors.tirsCadres ? "border-red-500" : ""}
            />
            {errors.tirsCadres && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tirsCadres.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="competition">Compétition *</Label>
            <Select
              onValueChange={(value) =>
                setValue("competition", value as SchemaModificationStatsEquipe["competition"])
              }
              value={watch("competition")}
            >
              <SelectTrigger
                id="competition"
                className={errors.competition ? "border-red-500" : ""}
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
            {errors.competition && (
              <p className="text-red-500 text-sm mt-1">
                {errors.competition.message}
              </p>
            )}
          </div>

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