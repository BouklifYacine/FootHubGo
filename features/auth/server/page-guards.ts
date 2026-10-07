import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { findMembership, getSession } from "@/lib/auth/session";

/**
 * Guards for server PAGES and layouts: same checks as `lib/auth/session`,
 * but they redirect instead of throwing.
 */

export async function requireSignedInPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session.user;
}

/** For the sign-in / sign-up pages. */
export async function requireSignedOutPage(to = "/app") {
  const session = await getSession();
  if (session) redirect(to);
}

/** Signed-in user who belongs to a team; users without a team go back to the app home. */
export async function requireTeamPage() {
  const user = await requireSignedInPage();
  const membership = await findMembership(user.id);
  if (!membership) redirect("/app");
  return { user, membership };
}

export async function requireAdminPage() {
  const user = await requireSignedInPage();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (dbUser?.role !== "ADMIN") redirect("/");
  return user;
}
