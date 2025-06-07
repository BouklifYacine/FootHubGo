import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import {  NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers() 
})

  if (!session?.user?.id)
    return NextResponse.json(
      {
        message: "Vous devez etre connecté pour accéder a ces infos ",
      },
      { status: 400 }
    );

  const equipe = await prisma.equipe.findMany();

  if (equipe.length === 0)
    return NextResponse.json(
      {
        message: "Il n'y a pas d'équipe disponible",
      },
      { status: 400 }
    );

  return NextResponse.json(equipe);
}
