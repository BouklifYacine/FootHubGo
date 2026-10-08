"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Hospital, LogOut, UserPlus } from "lucide-react";
import { useConfirm } from "@/components/app/confirm-dialog";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Page, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { sectionCategoryLabels, teamLevelLabels } from "@/lib/enum-labels";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { useRefreshAll } from "@/features/clubs/hooks/use-refresh-all";
import { useNavigation } from "@/components/app-shell/use-navigation";
import { leaveTeam } from "../actions";
import { useMyTeam } from "../hooks/use-my-team";
import { InviteCodeDialog } from "./invite-code-dialog";
import { JoinTeamDialog } from "./join-team-dialog";
import { SquadTable } from "./squad-table";

/** The Équipe tab: who is in the section, invite players, requests and injuries at hand. */
export function SquadView() {
  const { data, isPending, error, refetch } = useMyTeam();
  const { counts } = useNavigation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inviteOpen = searchParams.get("invite") === "1";
  const setInviteOpen = (open: boolean) => router.replace(open ? `${pathname}?invite=1` : pathname, { scroll: false });

  if (isPending) return <LoadingState className="mx-auto max-w-5xl" />;
  if (error) return <ErrorState error={error} onRetry={refetch} className="mx-auto max-w-5xl" />;
  const { team, canManage } = data;
  if (!team) return null;

  return (
    <Page>
      <PageHeader
        title="Équipe"
        description={`${team.displayName} · ${sectionCategoryLabels[team.category]} · ${teamLevelLabels[team.level]} · ${data.members.length} membre${data.members.length > 1 ? "s" : ""}`}
        actions={
          canManage && (
            <Button onClick={() => setInviteOpen(true)} >
              <UserPlus /> Inviter des joueurs
            </Button>
          )
        }
      />

      <div className="grid gap-2 sm:grid-cols-2">
        {canManage && (
          <ShortcutLink href="/app/join-requests" icon={UserPlus} label="Demandes d'adhésion" count={counts.joinRequests} />
        )}
        <ShortcutLink href="/app/injuries" icon={Hospital} label={canManage ? "Blessures de l'équipe" : "Mes blessures"} />
      </div>

      <SquadTable data={data} />

      <LeaveOrJoin sectionCount={data.sections.length} />

      {canManage && (
        <InviteCodeDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          code={team.inviteCode}
          sectionName={team.name}
          teamLabel={team.displayName}
        />
      )}
    </Page>
  );
}

function ShortcutLink({ href, icon: Icon, label, count = 0 }: { href: string; icon: typeof UserPlus; label: string; count?: number }) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center gap-3 rounded-xl border bg-card px-4 outline-none hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Icon className="size-5 text-muted-foreground" aria-hidden />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {count > 0 && <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-white">{count}</span>}
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  );
}

/** Bottom of the page: join another section of the club, or leave this one (asks first). */
function LeaveOrJoin({ sectionCount }: { sectionCount: number }) {
  const confirm = useConfirm();
  const refreshAll = useRefreshAll();
  const leave = useActionMutation(leaveTeam, { onSuccess: () => refreshAll("/app") });
  const leavesClub = sectionCount <= 1;

  return (
    <div className="flex flex-col gap-2 border-t pt-6 sm:flex-row sm:justify-between">
      <JoinTeamDialog label="Rejoindre une autre section" />
      <Button
        variant="ghost"
        className="text-destructive"
        disabled={leave.isPending}
        onClick={async () => {
          const ok = await confirm({
            title: leavesClub ? "Quitter le club ?" : "Quitter cette section ?",
            description: leavesClub
              ? "C'est ta seule section : tu quittes aussi le club, ses salons et ses groupes."
              : "Tu restes membre du club et de tes autres sections.",
            confirmLabel: "Quitter",
          });
          if (ok) leave.mutate();
        }}
      >
        <LogOut /> {leavesClub ? "Quitter le club" : "Quitter la section"}
      </Button>
    </div>
  );
}
