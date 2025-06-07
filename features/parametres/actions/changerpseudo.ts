"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { TypePseudo } from "../schemas/schema";
import { prisma } from "@/prisma";
import { VerifierElement } from "@/lib/argon2";
import { sendEmail } from "@/emails/email";
import { createElement } from "react";
import EmailChangementPseudo from "@/emails/EmailChangementPseudo";

export async function changerPseudo(donnees: TypePseudo) {
    try {
  const session = await auth.api.getSession({
        headers: await headers()
      });
      if (!session?.user?.id) throw new Error("Non autorisé");
  
      const { pseudo, codeverification } = donnees;
  
      // Récupérer l'utilisateur et ses comptes
      const utilisateur = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { accounts: true }
      });
  
      if (!utilisateur) throw new Error("Utilisateur non trouvé");
  
      // Vérifier si le pseudo existe déjà
      const pseudoExistant = await prisma.user.findUnique({
        where: { name: pseudo }
      });
  
      if (pseudoExistant) {
        throw new Error("Ce pseudo est déjà utilisé");
      }
  
      // Vérifier si l'utilisateur a un compte credentials
      const hasCredentials = utilisateur.accounts.some(acc => acc.providerId === "credentials");
  
      // Pour les utilisateurs avec credentials, vérifier le code
      if (hasCredentials) {
        const TokenValide = utilisateur.resetTokenExpiry && utilisateur.resetTokenExpiry > new Date();
        const codevalidecredentials = await VerifierElement(codeverification, utilisateur.resetToken || "");
  
        if (!codevalidecredentials || !TokenValide) {
          throw new Error("Code de vérification invalide ou expiré");
        }
      }
  
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: pseudo,
          ...(hasCredentials && {
            resetToken: null,
            resetTokenExpiry: null
          })
        }
      });
      
      const ancienPseudo = utilisateur.name
  
      if (utilisateur.email) {
        await sendEmail({
          to: utilisateur.email,
          subject: "Changement de pseudo",
          emailComponent: createElement(EmailChangementPseudo, {
            pseudo: ancienPseudo || "",
            name: pseudo
          })
        })
      }
  
      revalidatePath(`/parametres/${utilisateur.id}`)
      return { success: true }
    } catch (error) {
      return { error: (error as Error).message }
    }
  }