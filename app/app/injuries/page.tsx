import { redirect } from "next/navigation";
import { findMembership, getSession } from "@/lib/auth/session";
import { InjuriesOverview } from "@/features/injuries/components/injuries-overview";

export default async function InjuriesPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!(await findMembership(session.user.id))) redirect("/app");

  return <InjuriesOverview />;
}
