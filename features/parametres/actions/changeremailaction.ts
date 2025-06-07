'use server'

import { headers } from "next/headers"
import { TypeEmail } from "../schemas/schema"
import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { VerifierElement } from "@/lib/argon2"
import { sendEmail } from "@/emails/email"
import { createElement } from "react"
import EmailChangement from "@/emails/ChangementEmail"
import { revalidatePath } from "next/cache"

export async function changerEmail(donnees: TypeEmail) {
    try {
      const session = await auth.api.getSession({
        headers: await headers()
    })
      if (!session?.user?.id) throw new Error("Non autorisé")
  
      const { nouvelEmail, codeverification } = donnees
  
      const emailExistant = await prisma.user.findUnique({
        where: { email: nouvelEmail }
      })
  
      if (emailExistant) {
        throw new Error("Cet email est déjà utilisé")
      }
  
      const utilisateur = await prisma.user.findFirst({
        where: {
          id: session.user.id,
        }
      })
  
      const TokenValide = utilisateur?.resetTokenExpiry && utilisateur.resetTokenExpiry > new Date();
   
       if (!utilisateur?.resetToken) {
    throw new Error("Aucun code de vérification n'a été généré.");
  }
  
      const codevalide = await VerifierElement(codeverification , utilisateur.resetToken)
      
      if (!TokenValide || !codevalide) throw new Error("Code de vérification invalide ou expiré");
  
      const ancienEmail = utilisateur?.email
  
      await prisma.$transaction(async (db) => {
        await db.user.update({
          where: { id: session?.user?.id },
          data: {
            email: nouvelEmail,
            resetToken: null,
            resetTokenExpiry: null
          }
        })
        await db.session.deleteMany({
          where: { userId: session?.user?.id}
        })
      })
  
      await Promise.all([
        sendEmail({
          to: ancienEmail!,
          subject: "Changement de votre email",
          emailComponent: createElement(EmailChangement, {
            pseudo: utilisateur?.name || "",
            email: nouvelEmail,
            ancienemail: ancienEmail || ""
          })
        }),
        sendEmail({
          to: nouvelEmail,
          subject: "Confirmation de votre nouvel email",
          emailComponent: createElement(EmailChangement, {
            pseudo: utilisateur?.name || "",
            email: nouvelEmail,
            ancienemail: ancienEmail || ""
          })
        })
      ])
  
      revalidatePath('/parametres')
      return { success: true }
    } catch (error) {
      return { error: (error as Error).message }
    }
  }