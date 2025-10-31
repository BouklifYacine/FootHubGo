import { auth } from "@/auth";
import { headers } from "next/headers";

export async function GetSessionId() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Authentification requise");
  }
  return userId;
}
