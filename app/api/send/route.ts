
import { Resend } from 'resend';
import React from 'react';
import { EmailTemplate } from '@/components/email-template';
import { NextResponse } from 'next/server';

export async function POST() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { data, error } = await resend.emails.send({
      from: 'yacine@footygogo.com', // Votre nom de domaine 
      to: 'ybouklif@gmail.com', // mail a envoyer sur les API routes on va récuperer l'email avec la bdd normalement
      subject: 'Test', // Titre 
      react: React.createElement(EmailTemplate, { name: 'John' }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}