import {z} from "zod"

const SchemaInscription = z.object({
    password: z.string({error: "Vous devez mettre un mot de passe"})
        .min(1, {error: "Vous devez mettre un mot de passe"})
        .min(6, "Le mot de passe doit faire au minimum 6 caractères")
        .trim()
        .max(35, "Le mot de passe doit faire au maximum 35 caractères"),

    // `.pipe(z.email())` garde l'ordre des messages : "requis" avant "format invalide"
    email: z.string({error: "Vous devez mettre un email"})
        .min(1, {error: "Vous devez mettre un email"})
        .pipe(z.email("Format d'email invalide")),

        name: z.string({error: "Vous devez mettre un pseudo"})
        .min(1, {error: "Vous devez mettre un pseudo"})
        .min(6, "Le pseudo doit faire au minimum 6 caractères")
        .trim()
        .max(35, "Le pseudo doit faire au maximum 35 caractères")
 })
 
 export default SchemaInscription
