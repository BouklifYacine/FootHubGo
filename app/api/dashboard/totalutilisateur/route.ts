import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers() 
})
  const sessionId = session?.user?.id;
  if (!sessionId)
    return NextResponse.json("Vous devez etre connecté", { status: 401 });

  const admin = await prisma.user.findUnique({
    where: {
      id: sessionId,
    },
    select: { role: true },
  });

  if (admin?.role !== "Admin")
    return NextResponse.json("Vous devez etre admin !", { status: 403 });

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "0");
  const PAGE_SIZE = 10;

  const total = await prisma.user.count();

  const utilisateurs = await prisma.user.findMany({
    skip: page * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      plan: true,
      createdAt: true,
      abonnement: {
        select: {
          periode: true,
          datedebut: true,
          datefin: true,
        },
      },
    },
  });

  return NextResponse.json({
    message: "Utilisateurs récupérés avec succès",
    data: utilisateurs,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE)
  });
}