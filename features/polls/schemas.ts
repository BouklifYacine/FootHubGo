import { z } from "zod";

export const POLL_MAX_OPTIONS = 10;

const option = z.string().trim().min(1, "Une option est vide").max(80, "Une option est trop longue (80 caractères max)");

export const createPollSchema = z
  .object({
    question: z.string().trim().min(3, "La question est trop courte").max(200, "La question est trop longue"),
    options: z
      .array(option)
      .min(2, "Il faut au moins 2 options")
      .max(POLL_MAX_OPTIONS, `${POLL_MAX_OPTIONS} options maximum`),
    isMulti: z.boolean(),
    expiresAt: z.date({ error: "Date de fin invalide" }).optional(),
  })
  .superRefine(({ options, expiresAt }, ctx) => {
    const lower = options.map((o) => o.toLowerCase());
    if (new Set(lower).size !== lower.length) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "Deux options sont identiques" });
    }
    if (expiresAt && expiresAt <= new Date()) {
      ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "La date de fin doit être dans le futur" });
    }
  });
export type CreatePollInput = z.input<typeof createPollSchema>;

/** The full set of the voter's choices (replaces the previous vote). An empty list removes the vote. */
export const voteSchema = z.object({
  pollId: z.string().min(1),
  choices: z.array(option).max(POLL_MAX_OPTIONS),
});

export const pollIdSchema = z.string().min(1);
