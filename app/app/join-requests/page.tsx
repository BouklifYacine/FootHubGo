import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/app/page-header";
import { findMembership } from "@/lib/auth/session";
import { requireSignedInPage } from "@/features/auth/server/page-guards";
import { canManageSection } from "@/features/clubs/rules";
import { MyJoinRequests } from "@/features/join-requests/components/my-join-requests";
import { TeamDirectory } from "@/features/join-requests/components/team-directory";
import { TeamJoinRequests } from "@/features/join-requests/components/team-join-requests";

export const metadata: Metadata = { title: "Demandes d'adhésion" };

/**
 * Section coaches and club OWNER / ADMIN review the requests they received; users without a club
 * follow theirs and browse the club directory.
 */
export default async function JoinRequestsPage() {
  const user = await requireSignedInPage();
  const membership = await findMembership(user.id);
  if (membership) {
    const managesASection = membership.sections.some((section) => canManageSection(membership, section.teamId));
    if (!managesASection) redirect("/app");
    return <TeamJoinRequests />;
  }

  return (
    <Page className="max-w-3xl">
      <PageHeader
        title="Trouver un club"
        description="Postule dans une section : ses coachs reçoivent ta demande. Tu as un code ? Entre-le sur l'accueil."
      />
      <MyJoinRequests />
      <TeamDirectory />
    </Page>
  );
}
