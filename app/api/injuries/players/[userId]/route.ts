import { route } from "@/lib/api/route";
import { requireCoach, requireUser } from "@/lib/auth/session";
import { forbidden } from "@/lib/errors";
import { prisma } from "@/prisma";
import { getPlayerInjuries } from "@/features/injuries/server/queries";

/** Health data: a player sees their own injuries, a coach those of their team's players. */
export const GET = route<{ userId: string }>(async ({ params }) => {
  const user = await requireUser();
  if (params.userId === user.id) return getPlayerInjuries(user.id);

  const { membership } = await requireCoach();
  const player = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: params.userId, teamId: membership.teamId } },
    select: { id: true },
  });
  if (!player) throw forbidden("Ce joueur n'appartient pas à ton équipe");
  return getPlayerInjuries(params.userId, membership.teamId);
});
