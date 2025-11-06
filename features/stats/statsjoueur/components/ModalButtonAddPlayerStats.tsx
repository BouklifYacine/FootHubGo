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
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAjouterStatsJoueur } from "../hooks/useAjouterStatsJoueur";
import {
  AjouterStatsJoueurSchema,
  enumsPoste,
  schemaAjouterStatsJoueurSchema,
} from "../schema/AjouterStatsJoueurSchema";

interface Props {
  eventid: string;
  playerId: string;
}

export function ModalButtonAddPlayerStats({ eventid, playerId }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useAjouterStatsJoueur(playerId, eventid);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<schemaAjouterStatsJoueurSchema>({
    resolver: zodResolver(AjouterStatsJoueurSchema),
    defaultValues: {
      poste: "GARDIEN",
      buts: 0,
      passesdecisive: 0,
      minutesJouees: 90,
      note: 6,
      titulaire: true,
    },
  });

  const onSubmit = (data: schemaAjouterStatsJoueurSchema) => {
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
          size="icon"
          className="rounded-full"
          aria-label="Add new item"
        >
          <Plus size={16} strokeWidth={2} />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter les stats joueurs</DialogTitle>
          <DialogDescription>
            Remplissez les informations sur la performance de votre joueur
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="poste">Poste *</Label>
            <Select
              value={watch("poste")}
              onValueChange={(v) =>
                setValue("poste", v as schemaAjouterStatsJoueurSchema["poste"])
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

          <div>
            <Label htmlFor="buts">Buts*</Label>
            <Input
              id="buts"
              type="number"
              {...register("buts")}
              className={errors.buts ? "border-red-500" : ""}
            />
            {errors.buts && (
              <p className="text-red-500 text-sm">{errors.buts.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="passesdecisive">Passes décisives*</Label>
            <Input
              id="passesdecisive"
              type="number"
              {...register("passesdecisive")}
              className={errors.passesdecisive ? "border-red-500" : ""}
            />
            {errors.passesdecisive && (
              <p className="text-red-500 text-sm">
                {errors.passesdecisive.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="minutesJouees">Minutes jouées*</Label>
            <Input
              id="minutesJouees"
              type="number"
              {...register("minutesJouees")}
              className={errors.minutesJouees ? "border-red-500" : ""}
            />
            {errors.minutesJouees && (
              <p className="text-red-500 text-sm">
                {errors.minutesJouees.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="note">Note*</Label>
            <Input
              id="note"
              type="number"
              step="0.1"
              {...register("note")}
              className={errors.note ? "border-red-500" : ""}
            />
            {errors.note && (
              <p className="text-red-500 text-sm">{errors.note.message}</p>
            )}
          </div>

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