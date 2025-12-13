"use client";

import { RiDeleteBinLine } from "@remixicon/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EventInput>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      typeEvenement: "ENTRAINEMENT",
      dateDebut: dayjs().add(7, "day").toDate(),
    },
  });

  const typeEvenement = watch("typeEvenement");

  // Reset form when dialog opens or event changes
  useEffect(() => {
    if (isOpen) {
      if (event && event.id) {
        // Editing existing event
        reset({
          titre: event.title,
          dateDebut: event.start,
          typeEvenement: event.typeEvenement || "ENTRAINEMENT",
          lieu: event.location || "",
          adversaire: event.adversaire || null,
        });
        setIsEditMode(false); // Default to view mode for existing events
      } else {
        // Creating new event
        reset({
          titre: "",
          dateDebut: event?.start || dayjs().add(7, "day").toDate(),
          typeEvenement: "ENTRAINEMENT",
          lieu: "",
          adversaire: null,
        });
        setIsEditMode(true); // Always edit mode for new events
      }
    }
  }, [isOpen, event, reset]);

  const onSubmit = (data: EventInput) => {
    // Guard: Only coaches can create/update events
    if (!canEdit) return;
    // Guard: Cannot modify protected events
    if (isProtected) return;

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
  };

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
                    dayjs(event.start).format("D MMMM YYYY [à] HH:mm")}
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
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* Titre */}
            <div className="space-y-1">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                {...register("titre")}
                placeholder="Ex: Entraînement tactique"
                className={errors.titre ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.titre && (
                <p className="text-xs text-red-500">{errors.titre.message}</p>
              )}
            </div>

            {/* Type */}
            <Controller
              name="typeEvenement"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <Label htmlFor="typeEvenement">Type d'événement</Label>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "ENTRAINEMENT") {
                        setValue("adversaire", null);
                      }
                    }}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={errors.typeEvenement ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRAINEMENT">Entraînement</SelectItem>
                      <SelectItem value="CHAMPIONNAT">Championnat</SelectItem>
                      <SelectItem value="COUPE">Coupe</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.typeEvenement && (
                    <p className="text-xs text-red-500">
                      {errors.typeEvenement.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Date */}
            <Controller
              name="dateDebut"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <Label>Date et heure</Label>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    className={errors.dateDebut ? "border-red-500" : ""}
                    // disabled={isLoading} // Check if DateTimePicker supports disabled
                  />
                  {errors.dateDebut && (
                    <p className="text-xs text-red-500">
                      {errors.dateDebut.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Lieu */}
            <div className="space-y-1">
              <Label htmlFor="lieu">Lieu</Label>
              <div className="relative">
                <Input
                  id="lieu"
                  {...register("lieu")}
                  placeholder="Stade municipal"
                  className={errors.lieu ? "pl-8 border-red-500" : "pl-8"}
                  disabled={isLoading}
                />
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.lieu && (
                <p className="text-xs text-red-500">{errors.lieu.message}</p>
              )}
            </div>

            {/* Adversaire */}
            {typeEvenement !== "ENTRAINEMENT" && (
              <div className="space-y-1">
                <Label htmlFor="adversaire">Adversaire</Label>
                <div className="relative">
                  <Input
                    id="adversaire"
                    {...register("adversaire")}
                    placeholder="Nom de l'équipe adverse"
                    className={
                      errors.adversaire ? "pl-8 border-red-500" : "pl-8"
                    }
                    disabled={isLoading}
                  />
                  <Swords className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.adversaire && (
                  <p className="text-xs text-red-500">
                    {errors.adversaire.message}
                  </p>
                )}
              </div>
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
                            `/dashboardfoothub/evenements/${event?.id}`
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
                        router.push(`/dashboardfoothub/evenements/${event.id}`)
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
                    reset();
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
