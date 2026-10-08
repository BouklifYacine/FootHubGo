import { z } from "zod";
import { MAX_SEATS } from "./rules";

const id = z.string().min(1).max(64);

/** The driver's form: same schema for offering and editing a ride. */
export const rideFieldsSchema = z.object({
  seats: z
    .number({ error: "Indique le nombre de places" })
    .int("Nombre entier attendu")
    .min(1, "Propose au moins une place")
    .max(MAX_SEATS, `${MAX_SEATS} places maximum`),
  departurePlace: z
    .string()
    .trim()
    .min(2, "Indique le lieu de départ")
    .max(100, "Le lieu de départ ne peut pas dépasser 100 caractères"),
  departureTime: z.date({ error: "Indique l'heure de départ" }),
  note: z.string().trim().max(200, "La note ne peut pas dépasser 200 caractères").optional(),
});

export type RideFormValues = z.input<typeof rideFieldsSchema>;

export const offerRideSchema = rideFieldsSchema.extend({ eventId: id });
export const updateRideSchema = rideFieldsSchema.extend({ rideId: id });
export const rideIdSchema = id;
export const passengerIdSchema = id;
