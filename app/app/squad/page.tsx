import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/app/loading-state";
import { requireTeamPage } from "@/features/auth/server/page-guards";
import { SquadView } from "@/features/team/components/squad-view";

export const metadata: Metadata = { title: "Équipe" };

export default async function SquadPage() {
  await requireTeamPage();
  return (
    <Suspense fallback={<LoadingState />}>
      <SquadView />
    </Suspense>
  );
}
