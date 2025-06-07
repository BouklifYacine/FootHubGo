"use server"

import { headers } from "next/headers"
import { TypeMotDePasse } from "../schemas/schema"
import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { HashPassword, VerifierElement } from "@/lib/argon2"
import { sendEmail } from "@/emails/email"
import { createElement } from "react"
import NotifChangementMotDePasse from "@/emails/NotifChangementMotDePasse"
import { revalidatePath } from "next/cache"

export async function changerMotDePasse(donnees: TypeMotDePasse) {
    try {
      const session = await auth.api.getSession({
        headers: await headers()
      })
      if (!session?.user?.id) throw new Error("Non autorisé")
  
      const { motdepasse, codeverification } = donnees
  
      // ✅ Récupérer l'utilisateur avec ses accounts
      const utilisateur = await prisma.user.findFirst({
        where: {
          id: session.user.id,
        },
        include: {
          accounts: true // Inclure les accounts
        }
      })
  
      const TokenValide = utilisateur?.resetTokenExpiry && utilisateur.resetTokenExpiry > new Date();
      
      if (!utilisateur?.resetToken) {
        throw new Error("Aucun code de vérification n'a été généré.");
      }
  
      const codevalide = await VerifierElement(codeverification, utilisateur.resetToken);
  
      if (!TokenValide || !codevalide) throw new Error("Code de vérification invalide ou expiré");
  
      // ✅ Trouver l'account credential
      const accountCredential = utilisateur.accounts.find(acc => acc.providerId === "credential");
      
      if (!accountCredential) {
        throw new Error("Aucun compte avec mot de passe trouvé");
      }
  
      const motDePasseHashe = await HashPassword(motdepasse);
  
      await prisma.$transaction(async (db) => {
        await db.user.update({
          where: { id: session?.user?.id },
          data: {
            resetToken: null,
            resetTokenExpiry: null
          }
        })
  
        // ✅ Utiliser l'ID de l'account
        await db.account.update({
          where: { id: accountCredential.id }, 
          data: {
            password: motDePasseHashe
          }
        })
  
        // Suppression de toutes les sessions
        await db.session.deleteMany({
          where: { userId: session?.user?.id }
        })
      })
  
      await sendEmail({
        to: utilisateur?.email || "",
        subject: "Changement de mot de passe",
        emailComponent: createElement(NotifChangementMotDePasse, {
          pseudo: utilisateur?.name || ""
        })
      })
  
      revalidatePath(`/parametres/${utilisateur.id}`)
      return { success: true }
    } catch (error) {
      return { error: (error as Error).message }
    }
  }