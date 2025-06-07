import { z } from "zod";


  
 export const StatistiqueEquipeSchema = z.object({
    resultatMatch: z.enum(["VICTOIRE", "DEFAITE", "MATCH_NUL"], {
      required_error: "Veuillez sélectionner un résultat",
      invalid_type_error: "Résultat invalide"
    }),
    butsMarques: z.number({
      required_error: "Le nombre de buts marqués est obligatoire",
      invalid_type_error: "Le nombre de buts marqués doit être un nombre"
    }).int().min(0, "Le nombre de buts marqués ne peut pas être négatif"),
    butsEncaisses: z.number({
      required_error: "Le nombre de buts encaissés est obligatoire",
      invalid_type_error: "Le nombre de buts encaissés doit être un nombre"
    }).int().min(0, "Le nombre de buts encaissés ne peut pas être négatif"),
    cleanSheet: z.boolean().default(false),
    tirsTotal: z.number().int().min(0, "Le nombre de tirs ne peut pas être négatif").optional(),
    tirsCadres: z.number().int().min(0, "Le nombre de tirs cadrés ne peut pas être négatif").optional(),
    domicile: z.boolean().default(true),
    competition: z.enum(["CHAMPIONNAT", "COUPE"], {
      required_error: "Veuillez sélectionner un type de compétition",
      invalid_type_error: "Type de compétition invalide"
    }),
    adversaire: z.string().min(3, "Le nom de l'adversaire doit contenir au moins 3 caractères").max(50, "Le nom de l'adversaire ne peut pas dépasser 50 caractères")
  });