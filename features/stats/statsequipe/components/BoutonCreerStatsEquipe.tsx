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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useCreerStatsEquipe } from "@/features/stats/statsequipe/hooks/useCreerStatsEquipe";

import { Checkbox } from "@/components/ui/checkbox";
import { AjouterStatsEquipeSchema } from "@/features/stats/statsequipe/schema/AjouterStatsEquipeSchema";
import { $Enums } from "@prisma/client";

const enumsResultat = ["VICTOIRE", "DEFAITE", "NUL"] as const;
const enumsCompetition = ["CHAMPIONNAT", "COUPE"] as const;

type FormData = z.infer<typeof AjouterStatsEquipeSchema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(AjouterStatsEquipeSchema),
    defaultValues: {
      butsMarques: 0,
      butsEncaisses: 0,
      resultatMatch: "VICTOIRE",
      cleanSheet: false,
      domicile: true,
      competition: normalizeCompetition(typeEvenement),
    },
  });

  const onSubmit = (data: FormData) => {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Résultat du match */}
          <div>
            <Label htmlFor="resultatMatch">Résultat du match *</Label>
            <Select
              onValueChange={(value) =>
                setValue("resultatMatch", value as FormData["resultatMatch"])
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

          {/* Buts marqués */}
          <div>
            <Label htmlFor="butsMarques">Buts marqués *</Label>
            <Input
              id="butsMarques"
              type="number"
              {...register("butsMarques")}
              placeholder="Nombre de buts marqués"
              className={errors.butsMarques ? "border-red-500" : ""}
            />
            {errors.butsMarques && (
              <p className="text-red-500 text-sm mt-1">
                {errors.butsMarques.message}
              </p>
            )}
          </div>

          {/* Buts encaissés */}
          <div>
            <Label htmlFor="butsEncaisses">Buts encaissés *</Label>
            <Input
              id="butsEncaisses"
              type="number"
              {...register("butsEncaisses")}
              placeholder="Nombre de buts encaissés"
              className={errors.butsEncaisses ? "border-red-500" : ""}
            />
            {errors.butsEncaisses && (
              <p className="text-red-500 text-sm mt-1">
                {errors.butsEncaisses.message}
              </p>
            )}
          </div>

          {/* Clean sheet */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cleanSheet"
              {...register("cleanSheet")}
              onCheckedChange={(checked) => setValue("cleanSheet", !!checked)}
              checked={watch("cleanSheet")}
            />
            <Label htmlFor="cleanSheet">Clean sheet</Label>
            {errors.cleanSheet && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cleanSheet.message}
              </p>
            )}
          </div>

          {/* Domicile */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="domicile"
              {...register("domicile")}
              onCheckedChange={(checked) => setValue("domicile", !!checked)}
              checked={watch("domicile")}
            />
            <Label htmlFor="domicile">Match à domicile</Label>
            {errors.domicile && (
              <p className="text-red-500 text-sm mt-1">
                {errors.domicile.message}
              </p>
            )}
          </div>

          {/* Tirs totaux */}
          <div>
            <Label htmlFor="tirsTotal">Tirs totaux</Label>
            <Input
              id="tirsTotal"
              {...register("tirsTotal")}
              placeholder="Nombre total de tirs"
              className={errors.tirsTotal ? "border-red-500" : ""}
            />
            {errors.tirsTotal && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tirsTotal.message}
              </p>
            )}
          </div>

          {/* Tirs cadrés */}
          <div>
            <Label htmlFor="tirsCadres">Tirs cadrés</Label>
            <Input
              id="tirsCadres"
              {...register("tirsCadres")}
              placeholder="Nombre de tirs cadrés"
              className={errors.tirsCadres ? "border-red-500" : ""}
            />
            {errors.tirsCadres && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tirsCadres.message}
              </p>
            )}
          </div>

          {/* Compétition */}
          <div>
            <Label htmlFor="competition">Compétition *</Label>
            <Select disabled
              onValueChange={(value) =>
                setValue("competition", value as FormData["competition"])
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
