"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { CalendarIcon, Loader2 } from "lucide-react";
import { fr } from "date-fns/locale";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCreerEvenement } from "../(hooks)/UseCreerEvenement";
import {
  EvenementRecurrent,
  evenementRecurrentSchema,
  EvenementUnique,
  evenementUniqueSchema,
} from "@/app/(schema)/SchemaEvenementv2";

dayjs.locale("fr");

interface EvenementFormProps {
  equipeId: string;
}

interface JourOption {
  id: number;
  label: string;
}

const joursOptions: JourOption[] = [
  { id: 0, label: "Dimanche" },
  { id: 1, label: "Lundi" },
  { id: 2, label: "Mardi" },
  { id: 3, label: "Mercredi" },
  { id: 4, label: "Jeudi" },
  { id: 5, label: "Vendredi" },
  { id: 6, label: "Samedi" },
];

export default function EvenementForm({ equipeId }: EvenementFormProps) {
  const [recurrentTab, setRecurrentTab] = useState<"non" | "oui">("non");
  const { mutate, isPending } = useCreerEvenement(equipeId);

  // Formulaire pour événement unique
  const formUnique = useForm<EvenementUnique>({
    resolver: zodResolver(evenementUniqueSchema),
    defaultValues: {
      titre: "",
      description: "",
      lieu: "",
      typeEvenement: "ENTRAINEMENT",
      date: dayjs().format("YYYY-MM-DD"),
      heure: "18:00",
      recurrent: false,
    },
  });

  // Formulaire pour événement récurrent
  const formRecurrent = useForm<EvenementRecurrent>({
    resolver: zodResolver(evenementRecurrentSchema),
    defaultValues: {
      titre: "",
      description: "",
      lieu: "",
      typeEvenement: "ENTRAINEMENT",
      date: dayjs().format("YYYY-MM-DD"),
      heure: "18:00",
      recurrent: true,
      jours: [1, 3], // Lundi et mercredi par défaut
      dateFin: dayjs().add(30, "day").format("YYYY-MM-DD"), // 30 jours après
    },
  });

  // Gestion du changement d'onglet (récurrent ou non)
  const handleTabChange = (value: string) => {
    if (value === "oui" || value === "non") {
      setRecurrentTab(value);
    }
  };

  // Soumission du formulaire
  const onSubmitUnique = (data: EvenementUnique) => {
    mutate({
      ...data,
      recurrent: false,
    });
  };

  // Soumission du formulaire récurrent
  const onSubmitRecurrent = (data: EvenementRecurrent) => {
    mutate({
      ...data,
      recurrent: true,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Créer un événement</h2>

      <Tabs
        value={recurrentTab}
        onValueChange={handleTabChange}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="non">Événement unique</TabsTrigger>
          <TabsTrigger value="oui">Événements récurrents</TabsTrigger>
        </TabsList>

        <TabsContent value="non">
          <Form {...formUnique}>
            <form
              onSubmit={formUnique.handleSubmit(onSubmitUnique)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={formUnique.control}
                  name="titre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de l&apos;événement *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Entraînement hebdomadaire"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formUnique.control}
                  name="typeEvenement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d&apos;événement *</FormLabel>
                      <Select
                        onValueChange={
                          field.onChange as (value: string) => void
                        }
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
                control={formUnique.control}
                name="lieu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
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
                control={formUnique.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Informations complémentaires sur l&apos;événement..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={formUnique.control}
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
                                dayjs(field.value).format("dddd D MMMM YYYY")
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
                            onSelect={(date) => field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : "")}
                            initialFocus
                            disabled={(date) => dayjs(date).isBefore(dayjs().startOf("day"))}
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formUnique.control}
                  name="heure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création de l&apos;événement...
                  </>
                ) : (
                  "Créer l&apos;événement"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="oui">
          <Form {...formRecurrent}>
            <form
              onSubmit={formRecurrent.handleSubmit(onSubmitRecurrent)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={formRecurrent.control}
                  name="titre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de l&apos;événement *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Entraînement hebdomadaire"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formRecurrent.control}
                  name="typeEvenement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d&apos;événement *</FormLabel>
                      <Select
                        onValueChange={
                          field.onChange as (value: string) => void
                        }
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={formRecurrent.control}
                name="lieu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Stade municipal, Gymnase..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formRecurrent.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Informations complémentaires sur l&apos;événement..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={formRecurrent.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de début *</FormLabel>
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
                                dayjs(field.value).format("dddd D MMMM YYYY")
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
                            onSelect={(date) => field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : "")}
                            initialFocus
                            disabled={(date) => dayjs(date).isBefore(dayjs().startOf('day'))}
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formRecurrent.control}
                  name="heure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={formRecurrent.control}
                name="dateFin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de fin *</FormLabel>
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
                              dayjs(field.value).format("dddd D MMMM YYYY")
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
                          onSelect={(date) => field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : "")}
                          initialFocus
                          disabled={(date) => {
                            const aujourdhui = dayjs().startOf('day');
                            const dateDebut = dayjs(formRecurrent.getValues().date);
                            const maxDate = dateDebut.add(6, 'month');
                            
                            return dayjs(date).isBefore(aujourdhui) || 
                                   dayjs(date).isBefore(dateDebut) || 
                                   dayjs(date).isAfter(maxDate);
                          }}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      La date de fin ne peut pas être antérieure à la date de
                      début ni dépasser 6 mois après.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formRecurrent.control}
                name="jours"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        Jours de la semaine *
                      </FormLabel>
                      <FormDescription>
                        Sélectionnez les jours où l&apos;événement se répète
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {joursOptions.map((jour) => (
                        <FormItem
                          key={jour.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(jour.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, jour.id]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (value) => value !== jour.id
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {jour.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création des événements...
                  </>
                ) : (
                  "Créer les événements récurrents"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
