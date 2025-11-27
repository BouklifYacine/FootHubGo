// app/api/notifications/undelivered/route.ts
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const undeliveredNotifications = await prisma.notification.findMany({
      where: {
        userId,
        delivered: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            image: true,
            name: true,
          },
        },
      },
    });

    if (undeliveredNotifications.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: {
            in: undeliveredNotifications.map((n) => n.id),
          },
        },
        data: {
          delivered: true,
        },
      });
    }

    return NextResponse.json(undeliveredNotifications);
  } catch (error) {
    console.error("Error fetching undelivered notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
