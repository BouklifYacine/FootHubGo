import { prisma } from "@/prisma";
import { notFound } from "@/lib/errors";

/**
 * The user's profile. The plan shown is the CLUB's (the subscription belongs to the club, its
 * details only to the owner who pays it); a user without a club keeps their legacy plan.
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      role: true,
      plan: true,
      image: true,
      emailReminders: true,
      subscription: { select: { period: true, startDate: true, endDate: true } },
      accounts: { select: { providerId: true } },
      clubMembership: {
        select: {
          role: true,
          club: {
            select: {
              name: true,
              plan: true,
              subscription: { select: { period: true, startDate: true, endDate: true } },
            },
          },
        },
      },
    },
  });
  if (!user) throw notFound("Utilisateur introuvable");

  const { accounts, clubMembership, ...profile } = user;
  const providerIds = accounts.map((account) => account.providerId);
  const isClubOwner = clubMembership?.role === "OWNER";
  return {
    ...profile,
    plan: clubMembership ? clubMembership.club.plan : profile.plan,
    subscription: clubMembership ? (isClubOwner ? clubMembership.club.subscription : null) : profile.subscription,
    clubName: clubMembership?.club.name ?? null,
    /** Pays the subscription: the club owner, or a legacy subscriber without a club. */
    managesBilling: clubMembership ? isClubOwner : profile.plan === "pro",
    providerIds,
    hasPassword: providerIds.includes("credential"),
  };
}
