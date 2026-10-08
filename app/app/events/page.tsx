import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/prisma";
import { LoadingState } from "@/components/app/loading-state";
import { requireTeamPage } from "@/features/auth/server/page-guards";
import { canManageSection, isClubAdmin } from "@/features/clubs/rules";
import { Agenda } from "@/features/events/components/agenda";

export const metadata: Metadata = { title: "Agenda" };

export default async function AgendaPage() {
  const { membership } = await requireTeamPage();

  // Club OWNER / ADMIN choose who a new event is for: the active section (default), the whole club
  // or another section of the club. The server checks the choice again (createEvent).
  let scopeOptions: { value: string; label: string }[] | undefined;
  if (isClubAdmin(membership.clubRole)) {
    const sections = await prisma.team.findMany({
      where: { clubId: membership.clubId, id: { not: membership.teamId } },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });
    scopeOptions = [
      { value: membership.teamId, label: `${membership.team.name} (section active)` },
      { value: "CLUB", label: "Tout le club" },
      ...sections.map((section) => ({ value: section.id, label: section.name })),
    ];
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <Agenda canManage={canManageSection(membership, membership.teamId)} scopeOptions={scopeOptions} />
    </Suspense>
  );
}
