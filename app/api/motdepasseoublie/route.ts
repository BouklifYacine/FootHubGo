import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import CodeConfirmation from "@/emails/CodeConfirmation";
import React from "react";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
      include : {accounts : true},
    });

    if (!user) {
      return NextResponse.json(
        { message: "Aucun compte n'est associé à cette adresse email" },
        { status: 404 }
      );
    }

    if (user.accounts[0].providerId !== "credential") {
      return NextResponse.json(
        { message: `Compte relié a ${user.accounts[0].providerId} impossible de changer de mot de passe` },
        { status: 404 }
      );
    }

    // Génère un code à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationcode = new Date(Date.now() + 3600000); // 1 heure normalement

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetCode,
        resetTokenExpiry: expirationcode,
      },
    });

    await resend.emails.send({
      from: 'yacine@footygogo.com',
      to: email,
      subject: 'Changement de mot de passe',
      react: React.createElement(CodeConfirmation, { resetCode , pseudo : user.email || "" }),
    });

    return NextResponse.json({ message: "Code envoyé par email dans les spams " });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 400 }
    );
  }
}