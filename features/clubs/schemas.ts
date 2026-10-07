import { z } from "zod";
import { ClubVisibility, SectionCategory, TeamLevel } from "@/generated/prisma/browser";

const clubName = z
  .string()
  .trim()
  .min(3, "Le nom du club doit faire au moins 3 caractères")
  .max(30, "Le nom du club ne peut pas dépasser 30 caractères");

const sectionName = z
  .string()
  .trim()
  .min(2, "Le nom de la section doit faire au moins 2 caractères")
  .max(30, "Le nom de la section ne peut pas dépasser 30 caractères");

/** Club information (edit form). */
export const clubSchema = z.object({
  name: clubName,
  description: z
    .string()
    .trim()
    .max(300, "La description ne peut pas dépasser 300 caractères")
    .refine((value) => value === "" || value.length >= 10, {
      message: "La description doit faire au moins 10 caractères",
    }),
  visibility: z.enum(ClubVisibility, { error: "Choisissez une visibilité" }),
});
export type ClubInput = z.infer<typeof clubSchema>;

/** A section: name ("Seniors A"), category and level. */
export const sectionSchema = z.object({
  name: sectionName,
  category: z.enum(SectionCategory, { error: "Choisissez une catégorie" }),
  level: z.enum(TeamLevel, { error: "Choisissez un niveau" }),
});
export type SectionInput = z.infer<typeof sectionSchema>;

/** Create-club form: the club and its first section (the creator becomes OWNER and coach). */
export const createClubSchema = clubSchema.extend({
  sectionName,
  category: z.enum(SectionCategory, { error: "Choisissez une catégorie" }),
  level: z.enum(TeamLevel, { error: "Choisissez un niveau" }),
});
export type CreateClubInput = z.infer<typeof createClubSchema>;

export const updateSectionSchema = sectionSchema.extend({ teamId: z.string().min(1) });

export const teamIdSchema = z.string().min(1);

export const clubMemberIdSchema = z.string().min(1);

export const clubRoleSchema = z.object({
  clubMemberId: z.string().min(1),
  role: z.enum(["ADMIN", "MEMBER"], { error: "Rôle invalide" }),
});

/** Put a club member in a section with a role, change it, or (`role: null`) take them out of it. */
export const sectionMembershipSchema = z.object({
  clubMemberId: z.string().min(1),
  teamId: z.string().min(1),
  role: z.enum(["COACH", "PLAYER"]).nullable(),
});

export const checkoutSchema = z.object({ period: z.enum(["MONTH", "YEAR"]) });
