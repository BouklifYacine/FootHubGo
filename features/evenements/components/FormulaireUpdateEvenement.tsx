"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { isBefore } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUpdateEvenement } from "../(hooks)/UseUpdateEvenement";
import { UpdateEvenement, updateEvenementSchema } from "@/app/(schema)/SchemaUpdateEvenement";

dayjs.locale("fr");

interface FormulaireUpdateEvenementProps {
  equipeId: string;
  evenementId: string;
  evenement: {
    id: string;
    titre: string;
    description: string | null;
    lieu: string | null;
    typeEvenement: "MATCH" | "ENTRAINEMENT";
    dateDebut: Date;
  };
}

export default function FormulaireUpdateEvenement({ 
  equipeId, 
  evenementId, 
  evenement 
}: FormulaireUpdateEvenementProps) {
  const { mutate, isPending } = useUpdateEvenement(equipeId, evenementId);
  
  // Formatage des données initiales
  const dateEvenement = dayjs(evenement.dateDebut);
  const dateString = dateEvenement.format("YYYY-MM-DD");
  const heureString = dateEvenement.format("HH:mm");

  // Date actuelle pour désactiver les dates passées
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0); // Début de la journée

  // Configuration du formulaire avec valeurs par défaut sécurisées
  const form = useForm<UpdateEvenement>({
    resolver: zodResolver(updateEvenementSchema),
    defaultValues: {
      titre: evenement.titre,
      description: evenement.description ?? "",
      lieu: evenement.lieu ?? "",
      typeEvenement: evenement.typeEvenement,
      date: dateString,
      heure: heureString,
    },
  });

  // Fonction pour désactiver les dates passées
  const disabledDays = (date: Date) => {
    return isBefore(date, aujourdhui);
  };

  // Soumission du formulaire
  const onSubmit = (data: UpdateEvenement) => {
    mutate(data);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Modifier l&apos;événement</h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l&apos;événement *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Entraînement hebdomadaire" />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="typeEvenement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d&apos;événement *</FormLabel>
                  <Select
                    onValueChange={field.onChange as (value: string) => void}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ENTRAINEMENT">
                        Entraînement
                      </SelectItem>
                      <SelectItem value="MATCH">Match</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="lieu"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Lieu *</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    value={value ?? ""}
                    onChange={onChange}
                    placeholder="Stade municipal, Gymnase..."
                  />
                </FormControl>
                <FormDescription>
                  Indiquez l&apos;adresse ou le nom du lieu de l&apos;événement
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Description (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    {...fieldProps}
                    value={value ?? ""}
                    onChange={onChange}
                    placeholder="Informations complémentaires sur l'événement..."
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(dayjs(date).format("YYYY-MM-DD"));
                          }
                        }}
                        disabled={disabledDays}
                        locale={fr}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="text-xs text-muted-foreground mt-1">
                    Les dates dans le passé sont désactivées
                  </FormDescription>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="heure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      placeholder="18:00"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.history.back()}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 