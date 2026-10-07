import { prisma } from "@/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { ADMIN_PAGE_SIZE, adminUsersFiltersSchema } from "../schemas";

const PRICES = { MONTH: 5, YEAR: 50 } as const;

/** User counts and subscription revenue (active subscriptions only). */
export async function getAdminStats() {
  const [totalUsers, proUsers, subscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: "pro" } }),
    prisma.subscription.groupBy({
      by: ["period"],
      _count: { _all: true },
      where: { endDate: { gte: new Date() } },
    }),
  ]);

  const count = (period: "MONTH" | "YEAR") =>
    subscriptions.find((group) => group.period === period)?._count._all ?? 0;
  const monthly = count("MONTH");
  const yearly = count("YEAR");
  const revenue = monthly * PRICES.MONTH + yearly * PRICES.YEAR;
  const mrr = monthly * PRICES.MONTH + (yearly * PRICES.YEAR) / 12;

  return {
    totalUsers,
    proUsers,
    monthly,
    yearly,
    revenue,
    mrr: Math.round(mrr * 100) / 100,
    revenuePerUser: totalUsers ? Math.round((revenue / totalUsers) * 100) / 100 : 0,
  };
}

export async function getAdminUsers(query: Record<string, unknown>) {
  const { page, search, plan, period, role } = adminUsersFiltersSchema.parse(query);
  const where: Prisma.UserWhereInput = {
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...(plan && { plan }),
    ...(role && { role }),
    ...(period && { subscription: { period } }),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: page * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        plan: true,
        createdAt: true,
        subscription: { select: { period: true, startDate: true, endDate: true } },
      },
    }),
  ]);

  return { users, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}
