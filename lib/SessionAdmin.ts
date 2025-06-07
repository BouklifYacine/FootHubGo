
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function SessionAdmin() {
  const session = await auth.api.getSession({
    headers: await headers() 
})
    const userId = session?.user?.id;
  
    if (!userId) throw new Error("Authentification requise");
    
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { role: true }
    });
  
    if (user?.role !== "Admin") throw new Error("Privilèges insuffisants");
  }