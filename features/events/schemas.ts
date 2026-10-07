import { z } from "zod";
import { AttendanceStatus, EventType } from "@/generated/prisma/browser";

const eventFields = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit faire au moins 3 caractères")
    .max(35, "Le titre ne peut pas dépasser 35 caractères"),
  type: z.enum(EventType, { error: "Type d'événement invalide" }),
  startDate: z.date({ error: "Date invalide" }),
  // Optional: "" or missing means "no location"
  location: z.string().trim().max(100, "Le lieu ne peut pas dépasser 100 caractères").optional(),
  opponent: z.string().trim().max(50, "Le nom de l'adversaire est trop long").optional(),
});

/** A match (league / cup) needs an opponent; a training ignores it. */
function requireOpponentForMatches(event: z.infer<typeof eventFields>, ctx: z.RefinementCtx) {
  if (event.type !== "TRAINING" && (event.opponent ?? "").length < 3) {
    ctx.addIssue({
      code: "custom",
      path: ["opponent"],
      message: "L'adversaire est obligatoire pour un match (3 caractères minimum)",
    });
  }
}

export const eventSchema = eventFields.superRefine(requireOpponentForMatches);
export type EventFormValues = z.input<typeof eventSchema>;

export const updateEventSchema = eventFields
  .extend({ eventId: z.string().min(1) })
  .superRefine(requireOpponentForMatches);

export const moveEventSchema = z.object({
  eventId: z.string().min(1),
  startDate: z.date({ error: "Date invalide" }),
});

export const attendanceSchema = z.object({
  eventId: z.string().min(1),
  status: z.enum(AttendanceStatus, { error: "Statut de présence invalide" }),
});
