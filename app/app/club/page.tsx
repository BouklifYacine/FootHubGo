import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireTeamPage } from "@/features/auth/server/page-guards";
import { isClubAdmin } from "@/features/clubs/rules";
import { ClubAdminView } from "@/features/clubs/components/club-admin";

export const metadata: Metadata = { title: "Gérer le club" };

/** Club management: OWNER / ADMIN only (the data route checks it again). */
export default async function ClubPage() {
  const { membership } = await requireTeamPage();
  if (!isClubAdmin(membership.clubRole)) redirect("/app");
  return <ClubAdminView />;
}
