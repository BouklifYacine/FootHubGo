import { NextRequest, NextResponse } from "next/server";
import { unsubscribeWithToken } from "@/features/notifications/server/preferences";

// Called by mail clients (RFC 8058 one-click unsubscribe), not by the app: stays a REST route,
// authenticated by the signed token in the URL (no session, no cookie).
export async function POST(request: NextRequest) {
  const { ok } = await unsubscribeWithToken(request.nextUrl.searchParams.get("token"));
  return ok
    ? NextResponse.json({ message: "Rappels par email désactivés" })
    : NextResponse.json({ message: "Lien invalide" }, { status: 400 });
}
