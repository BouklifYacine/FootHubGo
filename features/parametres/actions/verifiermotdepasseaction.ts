'use server'

import { auth } from "@/auth"
import CodeConfirmation from "@/emails/CodeConfirmation"
import { hashElement, verifyPassword } from "@/lib/argon2"
import { sendEmail } from "@/emails/email"
import { prisma } from "@/prisma"
import { headers } from "next/headers"
import { createElement } from "react"

export async function verifierMotDePasse(motdepasse: string) {
    try {
  
     const session = await auth.api.getSession({
           headers: await headers()
       })
      if (!session?.user?.id) throw new Error("Non autorisé")
  
      const utilisateur = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { accounts: true }
      })
  
      const userpassword = utilisateur?.accounts[0].password
  
      if (!utilisateur) throw new Error("Utilisateur non trouvé")
  
        const credential = utilisateur.accounts[0].providerId === "credential"
  
      if (!credential) {
        const provider = utilisateur.accounts[0].providerId
        throw new Error(`Cette fonctionnalité n'est pas disponible car votre compte est lié à ${provider}`)
      }
  
      if (!userpassword) {
        throw new Error("Aucun mot de passe défini pour ce compte")
      }
  
  const motDePasseValide = await verifyPassword({
    password: motdepasse,
    hash: userpassword
  });
      if (!motDePasseValide) throw new Error("Mot de passe incorrect")
  
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
      const hashedResetCode = await hashElement(resetCode);
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          resetToken: hashedResetCode,
          resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000)
        }
      })
  
      await sendEmail({
        to: utilisateur.email!,
        subject: "Code de vérification",
        emailComponent: createElement(CodeConfirmation, {
          resetCode,
          pseudo: utilisateur.name || "Utilisateur"
        })
      })
  
      return { success: true }
    } catch (error) {
      return { error: (error as Error).message }
    }
  }