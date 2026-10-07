import { prisma } from "@/prisma";
import { notFound } from "@/lib/errors";

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      plan: true,
      image: true,
      subscription: { select: { period: true, startDate: true, endDate: true } },
      accounts: { select: { providerId: true } },
    },
  });
  if (!user) throw notFound("Utilisateur introuvable");

  const { accounts, ...profile } = user;
  return { ...profile, providerIds: accounts.map((account) => account.providerId) };
}
