import { redirect } from "next/navigation";
import { findMembership, getSession } from "@/lib/auth/session";
import { StatsOverview } from "@/features/stats/components/stats-overview";

export default async function StatsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!(await findMembership(session.user.id))) redirect("/app");

  return <StatsOverview />;
}
