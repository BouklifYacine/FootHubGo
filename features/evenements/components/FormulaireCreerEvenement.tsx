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
import { Swords, ArrowLeft, MapPin } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreationEvenementSchema } from "../schemas/CreationEvenementsSchema";
import { useCreerEvenement } from "../hooks/useCreerEvenement";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormData = z.infer<typeof CreationEvenementSchema>;

export default function FormulaireCreerEvenement() {
  const router = useRouter();
  const { mutate, isPending } = useCreerEvenement();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(CreationEvenementSchema),
    defaultValues: {
      typeEvenement: "ENTRAINEMENT",
      dateDebut: new Date(),
    },
    mode: "onChange",
  });

  const typeEvenement = watch("typeEvenement");
  const dateDebut = watch("dateDebut");

  const onSubmit = (data: FormData) => {
 
    mutate(
      { ...data },
      {
        onSuccess: () => {
          reset();
          router.refresh();
          router.push("/dashboardfoothub/evenements");
        },
      }
    );
    console.log(data)
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
        {/* Header du formulaire */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Créer un nouvel événement</h1>
          <p className="text-muted-foreground">
            Planifiez un entraînement ou un match pour votre équipe
          </p>
        </div>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l&apos;événement</CardTitle>
            <CardDescription>
              Remplissez les informations ci-dessous pour créer votre événement
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
              <div>
                <Label htmlFor="typeEvenement">Type d&apos;événement *</Label>
                <Select
                  onValueChange={(value) => {
                    setValue(
                      "typeEvenement",
                      value as FormData["typeEvenement"]
                    );
                    if (value === "ENTRAINEMENT") {
                      setValue("adversaire", "");
                    }
                    trigger("adversaire");
                  }}
                  value={typeEvenement}
                >
                  <SelectTrigger
                    id="typeEvenement"
                    className={errors.typeEvenement ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRAINEMENT">Entraînement</SelectItem>
                    <SelectItem value="CHAMPIONNAT">
                      Match de championnat
                    </SelectItem>
                    <SelectItem value="COUPE">Match de coupe</SelectItem>
                  </SelectContent>
                </Select>
                {errors.typeEvenement && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.typeEvenement.message}
                  </p>
                )}
              </div>

              {/* Date et heure */}
              <div>
                <Label htmlFor="dateDebut">Date et heure *</Label>
                <DateTimePicker
                  value={dateDebut}
                  onChange={(selectedDateTime) => {
                    setValue("dateDebut", selectedDateTime , {
                      shouldValidate: true,
                    });
                  }}
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
                  className="flex items-center gap-2 border border-black dark:border-white"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[140px]"
                >
                  {isPending ? "Création en cours..." : "Créer l'événement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
