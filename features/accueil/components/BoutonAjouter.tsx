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
import {
  SchemaCreationClub,
  niveau,
} from "@/features/creationclub/schemas/SchemaCreationClub";
import { useCreationClub } from "@/features/creationclub/hooks/useCreationClub";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormData = z.infer<typeof SchemaCreationClub>;

interface Props {
  texte: string;
}

function BoutonAjouter({ texte }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useCreationClub();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(SchemaCreationClub),
  });

  function onSubmit(data: FormData) {
    mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false); // Ferme la modal seulement si succès
        router.push("/dashboardfoothub/effectif");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="aspect-square max-sm:p-0 dark:bg-white text-black border border-gray-400 cursor-pointer"
        >
          <span>{texte}</span>
          <Plus
            className="opacity-60 sm:ml-1"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un club</DialogTitle>
          <DialogDescription>
            Remplis le formulaire pour créer un nouveau club. <br></br>
            Les élements avec un * sont obligatoire 
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom du club */}
          <div>
            <Label htmlFor="nom">Nom du club *</Label>
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
     
 <div>
            <Label htmlFor="NiveauClub">Niveau du club *</Label>
            <Select
              onValueChange={(value) =>
                setValue("NiveauClub", value as FormData["NiveauClub"])
              }
              value={watch("NiveauClub")}
            >
              <SelectTrigger
                id="NiveauClub"
                className={errors.NiveauClub ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Choisir un niveau" />
              </SelectTrigger>
              <SelectContent>
                {niveau.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.NiveauClub && (
              <p className="text-red-500 text-sm mt-1">
                {errors.NiveauClub.message}
              </p>
            )}
          </div>

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
            <Button
              type="submit"
              className=" px-4 py-2 rounded"
              disabled={isPending}
            >
              {isPending ? "Création ..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { BoutonAjouter };