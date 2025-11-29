import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  if (!session){
     return NextResponse.json(
      { message: "Vous n'etes pas connecté." },
      { status: 404 }
    );
  }

  const MembreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId },
    select: { equipeId: true },
  });
  if (!MembreEquipe) {
    return NextResponse.json(
      { message: "Vous n'appartenez à aucune équipe." },
      { status: 404 }
    );
  }
  const equipeId = MembreEquipe.equipeId;

  const qp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(qp.get("page") || "1", 10));
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(qp.get("pageSize") || "10", 10))
  );
  const skip = (page - 1) * pageSize;

  const [evenements, total] = await prisma.$transaction([
    prisma.evenement.findMany({
      where: { equipeId },
      orderBy: { dateDebut: "asc" },
      skip,
      take: pageSize,
      include: {
        presences: {
          where: { userId },
          select: { statut: true },
        },
      statEquipe: true
      },
    }),
    prisma.evenement.count({ where: { equipeId } }),
  ]);

  return NextResponse.json(
    {
      evenements: evenements.map((e) => ({
        ...e,
        statutPresence: e.presences[0]?.statut ?? "ATTENTE",
        hasStats: e.statEquipe !== null,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
    { status: 200 }
  );
}
