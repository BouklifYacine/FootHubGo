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
import {
  SchemaCreationClub,
  niveau,
} from "@/features/creationclub/schemas/SchemaCreationClub";
import { useCreationClub } from "@/features/creationclub/hooks/useCreationClub";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatNiveauClub } from "@/lib/formatEnums";
import { StatutClub } from "@/generated/prisma/browser";

type FormData = z.infer<typeof SchemaCreationClub>;

type FormValues = {
  nom: string;
  description?: string;
  NiveauClub: FormData["NiveauClub"] | undefined;
  statut: FormData["statut"] | undefined;
};

const defaultValues: FormValues = {
  nom: "",
  description: "",
  NiveauClub: undefined,
  statut: undefined,
};

interface Props {
  texte: string;
}

function BoutonAjouter({ texte }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useCreationClub();

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: SchemaCreationClub,
    },
    onSubmit: ({ value }) => {
      const data = SchemaCreationClub.parse(value);
      mutate(data, {
        onSuccess: () => {
          form.reset();
          setOpen(false);
          router.push("/app/squad");
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="nom">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="nom">Nom du club *</Label>
                  <Input
                    id="nom"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nom du club"
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="NiveauClub">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="NiveauClub">Niveau du club *</Label>
                  <Select
                    onValueChange={(value) =>
                      field.handleChange(value as FormData["NiveauClub"])
                    }
                    value={field.state.value}
                  >
                    <SelectTrigger
                      id="NiveauClub"
                      className={error ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Choisir un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {niveau.map((n) => (
                        <SelectItem key={n} value={n}>
                          {formatNiveauClub(n)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="statut">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="statut">Statut du club *</Label>
                  <Select
                    onValueChange={(value) =>
                      field.handleChange(value as FormData["statut"])
                    }
                    value={field.state.value}
                  >
                    <SelectTrigger
                      id="statut"
                      className={error ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Choisir un statut de club" />
                    </SelectTrigger>
                    <SelectContent defaultValue={StatutClub.PUBLIC}>

                        <SelectItem
                        value={StatutClub.PUBLIC}
                      >{StatutClub.PUBLIC}</SelectItem>

                      <SelectItem
                        value={StatutClub.INVITATION}
                      > {StatutClub.INVITATION} </SelectItem>

                      <SelectItem
                        value={StatutClub.PRIVE}
                      > {StatutClub.PRIVE} </SelectItem>

                    </SelectContent>
                  </Select>
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="description">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Description"
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
