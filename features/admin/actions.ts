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
import { leavesTeamWithoutCoach } from "./rules";

export const changeUserRole = action(changeUserRoleSchema, async ({ userId, role }) => {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new AppError("Vous ne pouvez pas modifier votre propre rôle");

  await prisma.user.update({ where: { id: userId }, data: { role } });
  return { message: `Rôle ${userRoleLabels[role]} attribué` };
});

export const deleteUsers = action(deleteUsersSchema, async (ids) => {
  const admin = await requireAdmin();
  if (ids.includes(admin.id)) throw new AppError("Vous ne pouvez pas supprimer votre propre compte ici");

  // A team must keep a coach: deleting its only coach while players remain would orphan it.
  const coachedTeams = await prisma.teamMember.findMany({
    where: { userId: { in: ids }, role: "COACH" },
    select: { team: { select: { name: true, members: { select: { userId: true, role: true } } } } },
  });
  const orphaned = coachedTeams.find(({ team }) => leavesTeamWithoutCoach(team.members, ids));
  if (orphaned) {
    throw new AppError(`Le club ${orphaned.team.name} n'aurait plus d'entraîneur : nommez-en un autre d'abord`);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, clientId: true },
  });
  await Promise.all(users.flatMap((user) => (user.clientId ? [cancelCustomerSubscriptions(user.clientId)] : [])));

  // Sessions, accounts, subscriptions... are removed by `onDelete: Cascade`.
  const [, { count }] = await prisma.$transaction([
    prisma.notification.updateMany({
      where: { fromUserName: { in: users.map((user) => user.name) } },
      data: { fromUserName: null, fromUserImage: null },
    }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);
  await Promise.all(users.map((user) => Promise.all([deleteAllAvatars(user.id), disconnectUserSockets(user.id)])));
  return { message: `${count} utilisateur${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}` };
});
