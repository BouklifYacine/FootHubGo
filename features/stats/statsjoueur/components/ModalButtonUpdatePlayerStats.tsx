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

export function ModalButtonEditPlayerStats({ eventid, joueur }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useModifierStatsJoueur();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TypeModifierStatsJoueurSchema>({
    resolver: zodResolver(ModifierStatsJoueurSchema),
    defaultValues: {
      poste: joueur.poste || "GARDIEN",
      buts: joueur.buts,
      passesdecisive: joueur.passesdecisive,
      minutesJouees: joueur.minutesJouees,
      note: joueur.note,
      titulaire: joueur.titulaire,
    },
  });

  const onSubmit = (data: TypeModifierStatsJoueurSchema) => {
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
          reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Poste */}
          <div>
            <Label htmlFor="poste">Poste *</Label>
            <Select
              value={watch("poste")}
              onValueChange={(v) =>
                setValue("poste", v as TypeModifierStatsJoueurSchema["poste"])
              }
            >
              <SelectTrigger
                id="poste"
                className={errors.poste ? "border-red-500" : ""}
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
            {errors.poste && (
              <p className="text-red-500 text-sm">{errors.poste.message}</p>
            )}
          </div>

          {/* Buts */}
          <div>
            <Label htmlFor="buts">Buts*</Label>
            <Input
              id="buts"
              type="number"
              {...register("buts", { valueAsNumber: true })}
              className={errors.buts ? "border-red-500" : ""}
            />
            {errors.buts && (
              <p className="text-red-500 text-sm">{errors.buts.message}</p>
            )}
          </div>

          {/* Passes décisives */}
          <div>
            <Label htmlFor="passesdecisive">Passes décisives*</Label>
            <Input
              id="passesdecisive"
              type="number"
              {...register("passesdecisive", { valueAsNumber: true })}
              className={errors.passesdecisive ? "border-red-500" : ""}
            />
            {errors.passesdecisive && (
              <p className="text-red-500 text-sm">
                {errors.passesdecisive.message}
              </p>
            )}
          </div>

          {/* Minutes jouées */}
          <div>
            <Label htmlFor="minutesJouees">Minutes jouées*</Label>
            <Input
              id="minutesJouees"
              type="number"
              {...register("minutesJouees", { valueAsNumber: true })}
              className={errors.minutesJouees ? "border-red-500" : ""}
            />
            {errors.minutesJouees && (
              <p className="text-red-500 text-sm">
                {errors.minutesJouees.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="note">Note*</Label>
            <Input
              id="note"
              type="number"
              step="0.1"
              {...register("note", { valueAsNumber: true })}
              className={errors.note ? "border-red-500" : ""}
            />
            {errors.note && (
              <p className="text-red-500 text-sm">{errors.note.message}</p>
            )}
          </div>

          {/* Titulaire */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="titulaire"
              checked={watch("titulaire")}
              onCheckedChange={(checked) => setValue("titulaire", !!checked)}
            />
            <Label htmlFor="titulaire">Titulaire</Label>
            {errors.titulaire && (
              <p className="text-red-500 text-sm">{errors.titulaire.message}</p>
            )}
          </div>

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