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
import { useModifierInfosClub } from "@/features/modifierinfosclub/hooks/useModifierInfosClub";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { useState } from "react";
import { SchemaModifierInfosClub } from "../schemas/SchemaModifierInfosClub";
import z from "zod";

type FormData = z.infer<typeof SchemaModifierInfosClub>;

function BoutonModifierClub() {
  const { data: clubData } = useInfosClub();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useModifierInfosClub();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(SchemaModifierInfosClub),
    defaultValues: {
      nom: clubData?.equipe.nom,
      description: clubData?.equipe.description || "",
      niveau: clubData?.equipe.niveau,
    },
  });

  function onSubmit(data: FormData) {
    if (!clubData?.equipe.id) return;
    mutate(
      { clubId: clubData.equipe.id, clubData: data },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      }
    );
  }

  if (!clubData || clubData.role !== "ENTRAINEUR") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl border border-white">
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier les informations du club</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de votre club.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom du club */}
          <div>
            <Label htmlFor="nom">Nom du club</Label>
            <Input
              id="nom"
              {...register("nom")}
              placeholder="Nom du club"
              className={errors.nom ? "border-red-500" : ""}
            />
            {errors.nom && (
              <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>
            )}
          </div>

          {/* Niveau du club */}
          <div>
            <Label htmlFor="niveau">Niveau</Label>
            <Select
              onValueChange={(value) =>
                setValue("niveau", value as FormData["niveau"])
              }
              value={watch("niveau")}
            >
              <SelectTrigger
                id="niveau"
                className={errors.niveau ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Sélectionner un niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOISIR">Loisir</SelectItem>
                <SelectItem value="DEPARTEMENTAL">Départemental</SelectItem>
                <SelectItem value="REGIONAL">Régional</SelectItem>
                <SelectItem value="NATIONAL">National</SelectItem>
              </SelectContent>
            </Select>
            {errors.niveau && (
              <p className="text-red-500 text-sm mt-1">
                {errors.niveau.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Description"
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
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
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { BoutonModifierClub };
