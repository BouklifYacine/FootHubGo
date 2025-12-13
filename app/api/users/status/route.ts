import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

// PATCH /api/users/status - Update user's online status
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { isOnline } = body;

    if (typeof isOnline !== "boolean") {
      return NextResponse.json(
        { message: "isOnline (boolean) requis" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: isOnline ? undefined : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      isOnline,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// GET /api/users/status?userIds=id1,id2 - Get online status for multiple users
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const userIdsParam = searchParams.get("userIds");

  if (!userIdsParam) {
    return NextResponse.json({ message: "userIds requis" }, { status: 400 });
  }

  try {
    const userIds = userIdsParam.split(",");

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    const statusMap = users.reduce(
      (acc, user) => {
        acc[user.id] = {
          isOnline: user.isOnline,
          lastSeen: user.lastSeen?.toISOString() || null,
        };
        return acc;
      },
      {} as Record<string, { isOnline: boolean; lastSeen: string | null }>
    );

    return NextResponse.json({ statuses: statusMap });
  } catch (error) {
    console.error("Error fetching status:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
