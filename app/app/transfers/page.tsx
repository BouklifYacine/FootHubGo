import { redirect } from "next/navigation";
import { findMembership } from "@/lib/auth/session";
import { requireSignedInPage } from "@/features/auth/server/page-guards";
import { MyJoinRequests } from "@/features/join-requests/components/my-join-requests";
import { TeamDirectory } from "@/features/join-requests/components/team-directory";
import { TeamJoinRequests } from "@/features/join-requests/components/team-join-requests";

/** Coaches review the requests they received; users without a club follow theirs and browse clubs. */
export default async function TransfersPage() {
  const user = await requireSignedInPage();
  const membership = await findMembership(user.id);
  if (membership?.role === "PLAYER") redirect("/app");
  if (membership) return <TeamJoinRequests teamId={membership.teamId} />;

  return (
    <div className="space-y-10">
      <MyJoinRequests />
      <TeamDirectory />
    </div>
  );
}
