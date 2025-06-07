"use server"

import { z } from "zod";
import SchemaInscription from "@/features/inscription/schemas/SchemaInscription";
import { prisma } from "@/prisma";
import EmailBienvenue from "@/emails/EmailBienvenue";
import { authClient } from "@/lib/auth-client";
import React from "react";
import { Resend } from "resend";

type Schema = z.infer<typeof SchemaInscription>;


export async function inscriptionAction(data: Schema) {
  try {
const resend = new Resend(process.env.RESEND_API_KEY);
    const validation = SchemaInscription.safeParse(data)
    if (!validation.success){
      return {
        success : false, 
        
      }
    }
    const emailutilisateur = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (emailutilisateur) {
      return {
        success: false,
        error: "Cet email est déja utilisé"
      };
    }

    const nomutilisateur = await prisma.user.findUnique({
      where: { name : data.name }
    });
    
    if (nomutilisateur) {
      return {
        success: false,
        error: "Ce pseudo est déja utilisé"
      };
    }
    await resend.emails.send({
        from: 'yacine@footygogo.com',
        to: data.email,
        subject: 'Bienvenue',
        react: React.createElement(EmailBienvenue, { name: data.name }),
      });

    await authClient.signUp.email({
        name: validation.data.name,
        email : validation.data.email,
        password: validation.data.password
    })

    return {
      success: true,
      data: {
        name: validation.data.name,
        message: "Inscription réussie"
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error || "Une erreur est survenue lors de l'inscription" 
    };
  }
}