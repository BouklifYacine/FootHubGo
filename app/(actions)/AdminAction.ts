"use server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function AdminAction() {
const session = await auth.api.getSession({
    headers: await headers() 
});
  const sessionID = session?.user?.id;

  if (!sessionID)
    return { success: false, message: "Vous n'avez pas de Session ID" };

  const utilisateur = await prisma.user.findUnique({
    where: { id: sessionID },
  });
  if (utilisateur?.role !== "Admin")
    return { success: false, message: "Vous n'etes pas admin " };

  return { success: true, Admin: utilisateur.role === "Admin" };
}
