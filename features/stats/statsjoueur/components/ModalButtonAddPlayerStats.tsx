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
import { Checkbox } from "@/components/ui/checkbox";
import { useAjouterStatsJoueur } from "../hooks/useAjouterStatsJoueur";
import {
  AjouterStatsJoueurSchema,
  schemaAjouterStatsJoueurSchema,
} from "../schema/AjouterStatsJoueurSchema";
import { $Enums } from "@/generated/prisma/browser";
import { getFormattedPosteOptions } from "@/lib/formatEnums";

type FormValues = z.input<typeof AjouterStatsJoueurSchema>;

interface Props {
  eventid: string;
  playerId: string;
  poste: $Enums.PosteJoueur | null;
}

export function ModalButtonAddPlayerStats({ eventid, playerId, poste }: Props) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useAjouterStatsJoueur(playerId, eventid);

  const defaultValues: FormValues = {
    poste: poste || "GARDIEN",
    buts: 0,
    passesdecisive: 0,
    minutesJouees: 90,
    note: 6,
    titulaire: true,
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: AjouterStatsJoueurSchema,
    },
    onSubmit: ({ value }) => {
      // Parse pour obtenir les valeurs coercées (nombres)
      const data = AjouterStatsJoueurSchema.parse(value);
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
                        v as schemaAjouterStatsJoueurSchema["poste"]
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
                      {getFormattedPosteOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
