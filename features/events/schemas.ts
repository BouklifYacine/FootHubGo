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
  description: z.string().trim().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
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

/** Creation only: a training can be repeated every week until `repeatUntil` (one season at most). */
export const eventSchema = eventFields
  .extend({
    repeatUntil: z.date({ error: "Date de fin invalide" }).optional(),
    /** "CLUB" (club-wide event) or a section id; omitted = the active section. Checked on the server. */
    scope: z.string().min(1).max(64).optional(),
  })
  .superRefine(requireOpponentForMatches)
  .superRefine(({ type, startDate, repeatUntil }, ctx) => {
    if (!repeatUntil) return;
    const issue = (message: string) => ctx.addIssue({ code: "custom", path: ["repeatUntil"], message });
    if (type !== "TRAINING") issue("Seuls les entraînements peuvent être répétés");
    else if (repeatUntil <= startDate) issue("La date de fin doit être après le premier entraînement");
    else if (repeatUntil.getTime() - startDate.getTime() > 366 * 24 * 3600 * 1000) {
      issue("La répétition ne peut pas dépasser un an");
    }
  });
/** The create / edit form: `repeat` only shows the repetition fields (`repeatUntil` is cleared when unchecked). */
export const eventFormSchema = eventSchema.and(z.object({ repeat: z.boolean() }));
export type EventFormValues = z.input<typeof eventFormSchema>;

export const updateEventSchema = eventFields
  .extend({ eventId: z.string().min(1) })
  .superRefine(requireOpponentForMatches);

export const deleteEventSchema = z.object({
  eventId: z.string().min(1),
  /** true: also deletes the following occurrences of its weekly series. */
  withFollowing: z.boolean().default(false),
});

export const moveEventSchema = z.object({
  eventId: z.string().min(1),
  startDate: z.date({ error: "Date invalide" }),
});

export const attendanceSchema = z.object({
  eventId: z.string().min(1),
  status: z.enum(AttendanceStatus, { error: "Statut de présence invalide" }),
});
