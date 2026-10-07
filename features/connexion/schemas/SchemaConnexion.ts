import { z } from 'zod';

export const SchemaConnexion = z.object({
  email: z.email("Veuillez entrer un email valide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type SchemaConnexionType = z.infer<typeof SchemaConnexion>;
