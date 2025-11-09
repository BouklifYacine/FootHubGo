import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireUserWithClub() {
    
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session.token || !session?.user.id) {
    redirect("/"); 
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      MembreEquipe: {
        include: {
          equipe: true,
        },
      },
    },
  });


  if (!user) {
    redirect("/");
  }

  if (user.MembreEquipe.length === 0) {
    redirect("/dashboard"); 
  }

  return user;
}
