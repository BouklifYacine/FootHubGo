"use server";

import { z } from "zod";
import { SchemaConnexion } from "@/features/connexion/schemas/SchemaConnexion";
import { auth } from "@/auth";

type Schema = z.infer<typeof SchemaConnexion>;

export async function connexionAction(data: Schema) {
  try {
   
    const validation = SchemaConnexion.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }


    const response = await auth.api.signInEmail({
      body: {
          email : validation.data.email,
          password : validation.data.password
      },
      asResponse: true // returns a response object instead of data
  });

    if (!response.ok) {
      return {
        success: false,
        error: "Email ou mot de passe incorrect",
      };
    }

    return {
      success: true,
     
    };
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la connexion",
    };
  }
}