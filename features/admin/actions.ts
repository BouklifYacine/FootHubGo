"use server";

import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireAdmin } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { userRoleLabels } from "@/lib/enum-labels";
import { cancelCustomerSubscriptions } from "@/features/billing/server/subscriptions";
import { deleteAllAvatars } from "@/features/settings/server/avatar";
import { disconnectUserSockets } from "@/server/realtime/emitter";
import { changeUserRoleSchema, deleteUsersSchema } from "./schemas";
import { syncChatOnClubLeft } from "@/features/team/server/team-chat";
import { clubLosingItsOwner } from "./rules";

export const changeUserRole = action(changeUserRoleSchema, async ({ userId, role }) => {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new AppError("Tu ne peux pas modifier ton propre rôle");

  await prisma.user.update({ where: { id: userId }, data: { role } });
  return { message: `Rôle ${userRoleLabels[role]} attribué` };
});

export const deleteUsers = action(deleteUsersSchema, async (ids) => {
  const admin = await requireAdmin();
  if (ids.includes(admin.id)) throw new AppError("Tu ne peux pas supprimer ton propre compte ici");

  // A club must keep its owner (subscription, deletion): they hand it over first.
  const owners = await prisma.clubMember.findMany({
    where: { userId: { in: ids }, role: "OWNER" },
    select: { userId: true, club: { select: { name: true } } },
  });
  const blocking = clubLosingItsOwner(
    owners.map((owner) => ({ userId: owner.userId, clubName: owner.club.name })),
    ids,
  );
  if (blocking) {
    throw new AppError(`Propriétaire du club ${blocking.clubName} : la propriété doit d'abord être transférée`);
  }
  const clubMembers = await prisma.clubMember.findMany({
    where: { userId: { in: ids } },
    select: { userId: true, clubId: true, sectionMemberships: { select: { teamId: true } } },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, clientId: true },
  });
  await Promise.all(users.flatMap((user) => (user.clientId ? [cancelCustomerSubscriptions(user.clientId)] : [])));

  // Sessions, accounts, legacy subscriptions, club and section memberships... are removed by `onDelete: Cascade`.
  const [, { count }] = await prisma.$transaction([
    prisma.notification.updateMany({
      where: { fromUserName: { in: users.map((user) => user.name) } },
      data: { fromUserName: null, fromUserImage: null },
    }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);
  await Promise.all(users.map((user) => Promise.all([deleteAllAvatars(user.id), disconnectUserSockets(user.id)])));
  for (const member of clubMembers) {
    await syncChatOnClubLeft(member.clubId, member.sectionMemberships.map((m) => m.teamId), member.userId);
  }
  return { message: `${count} utilisateur${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}` };
});
