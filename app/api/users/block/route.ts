import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

// POST /api/users/block - Block or unblock a user
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const blockerId = session?.user?.id;

  if (!blockerId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { userId: targetId, action } = body;

    if (!targetId || !action || !["block", "unblock"].includes(action)) {
      return NextResponse.json(
        { message: "userId et action (block/unblock) requis" },
        { status: 400 }
      );
    }

    if (blockerId === targetId) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas vous bloquer vous-même" },
        { status: 400 }
      );
    }

    if (action === "block") {
      await prisma.user.update({
        where: { id: blockerId },
        data: {
          blockedUsers: {
            connect: { id: targetId },
          },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: blockerId },
        data: {
          blockedUsers: {
            disconnect: { id: targetId },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      action,
      targetId,
    });
  } catch (error) {
    console.error("Error blocking/unblocking user:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// GET /api/users/block?targetId=xxx - Check if blocked
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("targetId");

  if (!targetId) {
    // Return list of blocked users
    try {
      const user = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: {
          blockedUsers: { select: { id: true, name: true, image: true } },
        },
      });
      return NextResponse.json({ blockedUsers: user?.blockedUsers || [] });
    } catch (error) {
      return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
  }

  // Check specific blocking status
  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        blockedUsers: { where: { id: targetId }, select: { id: true } },
        blockedBy: { where: { id: targetId }, select: { id: true } }, // Check if I am blocked by them too?
      },
    });

    const isBlockedByMe = (user?.blockedUsers.length || 0) > 0;
    const isBlockedByThem = (user?.blockedBy.length || 0) > 0;

    return NextResponse.json({
      isBlockedByMe,
      isBlockedByThem,
      canChat: !isBlockedByMe && !isBlockedByThem,
    });
  } catch (error) {
    console.error("Error checking block status:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
