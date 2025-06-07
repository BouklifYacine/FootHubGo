
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function AdminMiddlewareClient() {
  const session = await auth.api.getSession({
    headers: await headers() 
});
  const sessionID = session?.user?.id;
  if (!sessionID) redirect("/");
  const utilisateur = await prisma.user.findUnique({
    where: { id: sessionID },
  });
  const admin = utilisateur?.role === "Admin";
  if (!admin) redirect("/");
  
}
