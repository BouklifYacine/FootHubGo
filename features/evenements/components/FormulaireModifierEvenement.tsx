"use client";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-picker";
import { useModifierEvenement } from "../hooks/useModifierEvenement";
import { ModifierEvenementSchema } from "../schemas/ModificationEvenementsSchema";

import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Swords, ArrowLeft, MapPin } from "lucide-react";

type EvenementData = {
  titre: string;
  typeEvenement: "ENTRAINEMENT" | "CHAMPIONNAT" | "COUPE";
  dateDebut: string | Date;
  lieu?: string | null;
  adversaire?: string | null;
};

type FormData = z.infer<typeof ModifierEvenementSchema>;

interface Props {
  evenementInitial: EvenementData;
  id: string;
}

export default function FormulaireModifierEvenement({
  evenementInitial,
  id,
}: Props) {
  const router = useRouter();
  const { mutate, isPending } = useModifierEvenement();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(ModifierEvenementSchema),
    defaultValues: {
      titre: evenementInitial.titre ,
      typeEvenement: evenementInitial.typeEvenement,
      dateDebut: new Date(evenementInitial.dateDebut),
      lieu: evenementInitial.lieu || null,
      adversaire: evenementInitial.adversaire || null
    },
    mode: "onChange",
  });

  const typeEvenement = watch("typeEvenement");

  const onSubmit = (formData: FormData) => {
    // On envoie l'ID (qui ne fait pas partie du formulaire) avec les nouvelles données
    mutate(
      {
        id,
        data: formData,
      },
      {
        onSuccess: () => {
          router.refresh();
          router.push("/dashboardfoothub/evenements");
        },
        onError: (error) => {
          console.error("Erreur lors de la modification:", error);
        },
      }
    );

    console.log(formData);
  };

  return (
    <div>
      {/* Bouton retour */}
      <div className="p-6 pb-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 border border-black dark:border-white"
        >
          <ArrowLeft size={16} />
          Retour
        </Button>
      </div>

      <div className="container mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Modifier un événement</h1>
          <p className="text-muted-foreground">
            Mettez à jour les informations de l'événement pour votre équipe.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de l&apos;événement</CardTitle>
            <CardDescription>
              Modifiez les champs ci-dessous et sauvegardez les changements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Titre */}
              <div>
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  {...register("titre")}
                  placeholder="Titre de l'événement"
                  className={errors.titre ? "border-red-500" : ""}
                />
                {errors.titre && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.titre.message}
                  </p>
                )}
              </div>

              {/* Type d'événement */}
              <Controller
                name="typeEvenement"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="typeEvenement">
                      Type d&apos;événement *
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "ENTRAINEMENT") {
                          setValue("adversaire", undefined, { shouldValidate: true });
                        }
                      }}
                      value={field.value}
                    >
                      <SelectTrigger
                        id="typeEvenement"
                        className={errors.typeEvenement ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Choisir un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTRAINEMENT">
                          Entraînement
                        </SelectItem>
                        <SelectItem value="CHAMPIONNAT">Championnat</SelectItem>
                        <SelectItem value="COUPE">Coupe</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.typeEvenement && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.typeEvenement.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Date et heure */}
              <Controller
                name="dateDebut"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="dateDebut">Date et heure *</Label>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionner une date et heure"
                      error={!!errors.dateDebut}
                      className={errors.dateDebut ? "border-red-500" : ""}
                    />
                    {errors.dateDebut && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dateDebut.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Lieu */}
              <div>
                <Label htmlFor="lieu">Lieu</Label>
                <div className="relative">
                  <Input
                    id="lieu"
                    {...register("lieu")}
                    placeholder="Où se déroule l'événement ?"
                    className={errors.lieu ? "border-red-500 pl-9" : "pl-9"}
                  />
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                </div>
                {errors.lieu && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lieu.message}
                  </p>
                )}
              </div>

              {/* Adversaire (conditionnel) */}
              {typeEvenement !== "ENTRAINEMENT" && (
                <div>
                  <Label htmlFor="adversaire">Adversaire *</Label>
                  <div className="relative">
                    <Input
                      id="adversaire"
                      {...register("adversaire")}
                      placeholder="Nom de l'équipe adverse"
                      className={
                        errors.adversaire ? "border-red-500 pl-9" : "pl-9"
                      }
                    />
                    <Swords
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                  </div>
                  {errors.adversaire && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.adversaire.message}
                    </p>
                  )}
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[180px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    "Sauvegarder les changements"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
