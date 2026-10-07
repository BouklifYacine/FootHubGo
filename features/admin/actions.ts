"use server";

import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireAdmin } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { userRoleLabels } from "@/lib/enum-labels";
import { cancelCustomerSubscriptions } from "@/features/billing/server/subscriptions";
import { changeUserRoleSchema, deleteUsersSchema } from "./schemas";

export const changeUserRole = action(changeUserRoleSchema, async ({ userId, role }) => {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new AppError("Vous ne pouvez pas modifier votre propre rôle");

  await prisma.user.update({ where: { id: userId }, data: { role } });
  return { message: `Rôle ${userRoleLabels[role]} attribué` };
});

export const deleteUsers = action(deleteUsersSchema, async (ids) => {
  const admin = await requireAdmin();
  if (ids.includes(admin.id)) throw new AppError("Vous ne pouvez pas supprimer votre propre compte ici");

  const customers = await prisma.user.findMany({
    where: { id: { in: ids }, clientId: { not: null } },
    select: { clientId: true },
  });
  await Promise.all(customers.map((user) => cancelCustomerSubscriptions(user.clientId!)));

  // Sessions, accounts, subscriptions... are removed by `onDelete: Cascade`.
  const { count } = await prisma.user.deleteMany({ where: { id: { in: ids } } });
  return { message: `${count} utilisateur${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}` };
});
