import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;

  if (!id)
    return NextResponse.json(
      { message: "Id de l'évenement inexistant ou incorrect" },
      { status: 400 }
    );

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  if (!userId)
    return NextResponse.json(
      { message: "Vous devez vous connectez" },
      { status: 401 }
    );

  const membreEquipe = await prisma.membreEquipe.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!membreEquipe)
    return NextResponse.json({
      message: "Vous devez etre membre de l'équipe pour voir ses événements ",
    });

  const evenementUnique = await prisma.evenement.findUnique({
    where: { id },
  });

  if (!evenementUnique)
    return NextResponse.json(
      { message: "Cet evenement n'existe pas" },
      { status: 400 }
    );

    return NextResponse.json(evenementUnique)
}
