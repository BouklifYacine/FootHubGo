"use client";

import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { z } from "zod";
import {
  Swords,
  MapPin,
  Users,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarEvent } from "../types";
import { EventSchema, EventInput } from "../schemas/event.schema";
import { useCreateEvent } from "../hooks/use-create-event";
import { useUpdateEvent } from "../hooks/use-update-event";
import { useDeleteEvent } from "../hooks/use-delete-event";

type EventFormValues = z.input<typeof EventSchema>;

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
}

const presenceStatusConfig = {
  PRESENT: {
    label: "Présent",
    variant: "default" as const,
    className: "bg-green-500 hover:bg-green-600",
  },
  ABSENT: { label: "Absent", variant: "destructive" as const, className: "" },
  ATTENTE: {
    label: "En attente",
    variant: "secondary" as const,
    className: "",
  },
};

export function EventDialog({
  event,
  isOpen,
  onClose,
  canEdit = false,
}: EventDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const isCreating = !event || !event.id;
  const isViewing = !isCreating && !isEditMode;

  // Check if modification/deletion is blocked due to stats
  const isProtected =
    event?.hasStats &&
    (event?.typeEvenement === "CHAMPIONNAT" ||
      event?.typeEvenement === "COUPE");

  // Valeurs du formulaire recalculées à chaque ouverture / changement d'événement
  const defaultValues = useMemo<EventFormValues>(() => {
    if (event && event.id) {
      // Editing existing event
      return {
        titre: event.title,
        dateDebut: event.start,
        typeEvenement: event.typeEvenement || "ENTRAINEMENT",
        lieu: event.location || "",
        adversaire: event.adversaire || null,
      };
    }
    // Creating new event
    return {
      titre: "",
      dateDebut: event?.start || addDays(new Date(), 7),
      typeEvenement: "ENTRAINEMENT",
      lieu: "",
      adversaire: null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, isOpen]);

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: EventSchema,
    },
    onSubmit: ({ value }) => {
      // Guard: Only coaches can create/update events
      if (!canEdit) return;
      // Guard: Cannot modify protected events
      if (isProtected) return;

      const data: EventInput = EventSchema.parse(value);

      if (isCreating) {
        createEvent.mutate(data, {
          onSuccess: () => {
            onClose();
          },
        });
      } else if (event?.id) {
        updateEvent.mutate(
          { id: event.id, data },
          {
            onSuccess: () => {
              setIsEditMode(false);
              onClose();
            },
          }
        );
      }
    },
  });

  const typeEvenement = useStore(
    form.store,
    (state) => state.values.typeEvenement
  );

  // Reset form when dialog opens or event changes
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
      // Default to view mode for existing events, always edit mode for new events
      setIsEditMode(!(event && event.id));
    }
  }, [isOpen, event, defaultValues, form]);

  const handleDelete = () => {
    // Guard: Only coaches can delete events
    if (!canEdit) return;
    // Guard: Cannot delete protected events
    if (isProtected) return;

    if (event?.id) {
      deleteEvent.mutate(event.id, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const isLoading =
    createEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating
              ? "Créer un événement"
              : isEditMode
                ? "Modifier l'événement"
                : "Détails de l'événement"}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Ajoutez un nouvel événement au calendrier."
              : isEditMode
                ? "Modifiez les informations de l'événement."
                : "Informations sur l'événement."}
          </DialogDescription>
        </DialogHeader>

        {isViewing ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Titre</Label>
                <p className="font-medium text-lg">{event?.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Date</Label>
                <p>
                  {event?.start &&
                    format(event.start, "d MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Type</Label>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{event?.typeEvenement}</span>
                </div>
              </div>
              {event?.typeEvenement !== "ENTRAINEMENT" && (
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Adversaire
                  </Label>
                  <p>{event?.adversaire || "-"}</p>
                </div>
              )}
              <div className="col-span-2">
                <Label className="text-muted-foreground text-xs">Lieu</Label>
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="text-muted-foreground" />
                  <span>{event?.location || "Non spécifié"}</span>
                </div>
              </div>
            </div>

            {/* Stats protection warning */}
            {canEdit && isProtected && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                  <Lock
                    size={16}
                    className="text-amber-600 dark:text-amber-400"
                  />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Cet événement a des statistiques enregistrées et ne peut
                    plus être modifié ou supprimé.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form
            id="event-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4 py-4"
          >
            {/* Titre */}
            <form.Field name="titre">
              {(field) => {
                const error = field.state.meta.errors[0]?.message;
                return (
                  <div className="space-y-1">
                    <Label htmlFor="titre">Titre</Label>
                    <Input
                      id="titre"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Ex: Entraînement tactique"
                      className={error ? "border-red-500" : ""}
                      disabled={isLoading}
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                  </div>
                );
              }}
            </form.Field>

            {/* Type */}
            <form.Field name="typeEvenement">
              {(field) => {
                const error = field.state.meta.errors[0]?.message;
                return (
                  <div className="space-y-1">
                    <Label htmlFor="typeEvenement">Type d'événement</Label>
                    <Select
                      onValueChange={(value) => {
                        field.handleChange(
                          value as EventFormValues["typeEvenement"]
                        );
                        if (value === "ENTRAINEMENT") {
                          form.setFieldValue("adversaire", null);
                        }
                      }}
                      value={field.state.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={error ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTRAINEMENT">Entraînement</SelectItem>
                        <SelectItem value="CHAMPIONNAT">Championnat</SelectItem>
                        <SelectItem value="COUPE">Coupe</SelectItem>
                      </SelectContent>
                    </Select>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                  </div>
                );
              }}
            </form.Field>

            {/* Date */}
            <form.Field name="dateDebut">
              {(field) => {
                const error = field.state.meta.errors[0]?.message;
                return (
                  <div className="space-y-1">
                    <Label>Date et heure</Label>
                    <DateTimePicker
                      value={field.state.value}
                      onChange={(date) => field.handleChange(date)}
                      className={error ? "border-red-500" : ""}
                      // disabled={isLoading} // Check if DateTimePicker supports disabled
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                  </div>
                );
              }}
            </form.Field>

            {/* Lieu */}
            <form.Field name="lieu">
              {(field) => {
                const error = field.state.meta.errors[0]?.message;
                return (
                  <div className="space-y-1">
                    <Label htmlFor="lieu">Lieu</Label>
                    <div className="relative">
                      <Input
                        id="lieu"
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Stade municipal"
                        className={error ? "pl-8 border-red-500" : "pl-8"}
                        disabled={isLoading}
                      />
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                  </div>
                );
              }}
            </form.Field>

            {/* Adversaire */}
            {typeEvenement !== "ENTRAINEMENT" && (
              <form.Field name="adversaire">
                {(field) => {
                  const error = field.state.meta.errors[0]?.message;
                  return (
                    <div className="space-y-1">
                      <Label htmlFor="adversaire">Adversaire</Label>
                      <div className="relative">
                        <Input
                          id="adversaire"
                          name={field.name}
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Nom de l'équipe adverse"
                          className={error ? "pl-8 border-red-500" : "pl-8"}
                          disabled={isLoading}
                        />
                        <Swords className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                      {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                  );
                }}
              </form.Field>
            )}
          </form>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {isViewing ? (
            <>
              {canEdit && (
                <div className="flex w-full justify-end items-center gap-2">
                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/app/evenements/${event?.id}`
                          )
                        }
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {event?.typeEvenement === "ENTRAINEMENT"
                          ? "Voir les présences"
                          : "Voir les convocations"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (!isProtected) {
                            setIsEditMode(true);
                          }
                        }}
                        disabled={isProtected}
                        className={isProtected ? "opacity-50" : ""}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                        {isProtected && (
                          <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isLoading || isProtected}
                        className={`text-destructive focus:text-destructive ${isProtected ? "opacity-50" : ""}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                        {isProtected && (
                          <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {!canEdit && (
                <div className="flex w-full justify-between items-center gap-2">
                  {(event?.typeEvenement === "CHAMPIONNAT" ||
                    event?.typeEvenement === "COUPE") && (
                    <Button
                      className="w-full"
                      onClick={() =>
                        router.push(`/app/evenements/${event.id}`)
                      }
                    >
                      Voir convocation
                    </Button>
                  )}
                  <Button
                    type="button"
                    className={
                      event?.typeEvenement === "CHAMPIONNAT" ||
                      event?.typeEvenement === "COUPE"
                        ? "w-auto"
                        : "w-full sm:w-auto"
                    }
                    variant="outline"
                    onClick={onClose}
                  >
                    Fermer
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  if (isCreating) onClose();
                  else {
                    setIsEditMode(false);
                    form.reset();
                  }
                }}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" form="event-form" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
