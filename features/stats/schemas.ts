import { z } from "zod";
import { Competition, MatchResult, PlayerPosition } from "@/generated/prisma/browser";
import { MAX_MINUTES } from "./playing-time";

const count = (label: string) =>
  z
    .number({ error: `Indique ${label}` })
    .int("Nombre entier attendu")
    .min(0, "Minimum 0")
    .max(99, "Maximum 99");

const optionalCount = z
  .number()
  .int("Nombre entier attendu")
  .min(0, "Minimum 0")
  .max(99, "Maximum 99")
  .optional();

/** Team stats of a match: same schema for the create and edit forms and actions. */
export const teamStatsSchema = z
  .object({
    result: z.enum(MatchResult, { error: "Choisis un résultat" }),
    goalsFor: count("les buts marqués"),
    goalsAgainst: count("les buts encaissés"),
    totalShots: optionalCount,
    shotsOnTarget: optionalCount,
    isHome: z.boolean(),
    competition: z.enum(Competition, { error: "Choisis une compétition" }),
  })
  .superRefine((stats, ctx) => {
    const issue = (path: keyof typeof stats, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (stats.result === "WIN" && stats.goalsFor <= stats.goalsAgainst) {
      issue("goalsFor", "En cas de victoire, l'équipe marque plus de buts qu'elle n'en encaisse");
    }
    if (stats.result === "DRAW" && stats.goalsFor !== stats.goalsAgainst) {
      issue("goalsAgainst", "En cas de match nul, les buts marqués et encaissés sont égaux");
    }
    if (stats.result === "LOSS" && stats.goalsFor >= stats.goalsAgainst) {
      issue("goalsAgainst", "En cas de défaite, l'équipe encaisse plus de buts qu'elle n'en marque");
    }
    if (stats.totalShots !== undefined && stats.goalsFor > stats.totalShots) {
      issue("totalShots", "Il ne peut pas y avoir plus de buts que de tirs");
    }
    if (
      stats.totalShots !== undefined &&
      stats.shotsOnTarget !== undefined &&
      stats.shotsOnTarget > stats.totalShots
    ) {
      issue("shotsOnTarget", "Les tirs cadrés ne peuvent pas dépasser les tirs totaux");
    }
  });

export type TeamStatsValues = z.input<typeof teamStatsSchema>;

/** Stats of one player in a match. */
export const playerStatsSchema = z.object({
  position: z.enum(PlayerPosition, { error: "Choisis un poste" }),
  goals: count("les buts"),
  assists: count("les passes décisives"),
  minutesPlayed: z
    .number({ error: "Indique les minutes jouées" })
    .int("Nombre entier attendu")
    .min(0, "Minimum 0")
    .max(MAX_MINUTES, `Maximum ${MAX_MINUTES} minutes (prolongations comprises)`),
  /** Optional: empty = not rated (left out of the average rating). */
  rating: z.number().min(0, "Minimum 0").max(10, "La note maximale est 10").optional(),
  isStarter: z.boolean(),
});

/** The form also picks the player when adding stats. */
export const playerStatsFormSchema = playerStatsSchema.extend({
  userId: z.string().min(1, "Choisis un joueur"),
});

export type PlayerStatsFormValues = z.input<typeof playerStatsFormSchema>;

/** The coach's playing-time sheet of a match (every present player at once). */
export const playingTimeSchema = z.object({
  eventId: z.string().min(1),
  entries: z
    .array(
      z.object({
        userId: z.string().min(1),
        minutes: z
          .number({ error: "Indique les minutes jouées" })
          .int("Nombre entier attendu")
          .min(0, "Minimum 0")
          .max(MAX_MINUTES, `Maximum ${MAX_MINUTES} minutes`),
        isStarter: z.boolean(),
      }),
    )
    .min(1, "Aucun joueur")
    .max(60, "Trop de joueurs"),
});

export type PlayingTimeInput = z.input<typeof playingTimeSchema>;
