"use client";

import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import {
  Crown,
  CreditCard,
  KeyRound,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserMinus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  clubRoleLabels,
  clubVisibilityLabels,
  sectionCategoryLabels,
  subscriptionPeriodLabels,
  teamLevelLabels,
  teamRoleLabels,
} from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { startClubCheckout } from "@/features/billing/actions";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { InviteCodeDialog } from "@/features/team/components/invite-code-dialog";
import { formatInviteCode } from "@/features/team/invite-code";
import {
  deleteSection,
  removeClubMember,
  setClubRole,
  setSectionMembership,
  transferOwnership,
} from "../actions";
import { useClubAdmin, type ClubAdmin, type ClubAdminMember, type ClubAdminSection } from "../hooks/use-club-admin";
import { useRefreshAll } from "../hooks/use-refresh-all";
import {
  clubRoleChangeError,
  deleteSectionError,
  removeMemberError,
  sectionRoleChangeError,
  transferOwnershipError,
} from "../rules";
import { ClubFormDialog } from "./club-form-dialog";
import { DeleteClubDialog } from "./delete-club-dialog";
import { SectionFormDialog } from "./section-form-dialog";

const invalidate = [queryKeys.club.all, queryKeys.me.team, queryKeys.home, queryKeys.chat.all];

/** Club management (OWNER / ADMIN): club info, subscription, sections, members and their roles. */
export function ClubAdminView() {
  const { data, isPending, error } = useClubAdmin();

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    );
  }
  if (error) return <p className="p-5 text-red-500">{error.message}</p>;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-10">
      <ClubInfo data={data} />
      <Billing data={data} />
      <Sections data={data} />
      <Members data={data} />
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ---------- club ---------- */

function ClubInfo({ data }: { data: ClubAdmin }) {
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const { club } = data;
  const close = (open: boolean) => !open && setDialog(null);

  return (
    <Panel
      title="Club"
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setDialog("edit")}>
            <Pencil /> Modifier
          </Button>
          {data.myRole === "OWNER" && (
            <Button variant="destructive" size="sm" onClick={() => setDialog("delete")}>
              <Trash2 /> Supprimer
            </Button>
          )}
        </div>
      }
    >
      <div className="flex items-center gap-4">
        <InitialsAvatar name={club.name} src={club.logoUrl} className="size-14 text-lg" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{club.name}</h1>
          <p className="text-sm text-muted-foreground">
            {clubVisibilityLabels[club.visibility]} · votre rôle : {clubRoleLabels[data.myRole]}
          </p>
        </div>
      </div>
      {club.description && <p className="text-sm text-muted-foreground">{club.description}</p>}
      <ClubFormDialog
        open={dialog === "edit"}
        onOpenChange={close}
        club={{ name: club.name, description: club.description ?? "", visibility: club.visibility }}
      />
      <DeleteClubDialog open={dialog === "delete"} onOpenChange={close} />
    </Panel>
  );
}

function Billing({ data }: { data: ClubAdmin }) {
  const checkout = useActionMutation(startClubCheckout, {
    toast: "errors",
    onSuccess: (result) => result && window.location.assign(result.url),
  });
  const { club } = data;
  const portalUrl = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL;

  return (
    <Panel title="Abonnement du club">
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <CreditCard className="size-4 text-muted-foreground" />
        <Badge>{club.plan === "pro" ? "Premium" : "Gratuit"}</Badge>
        {club.subscription && (
          <span className="text-muted-foreground">
            {subscriptionPeriodLabels[club.subscription.period]} · jusqu&apos;au{" "}
            {format(club.subscription.endDate, "dd/MM/yyyy")}
          </span>
        )}
      </p>
      {!data.canManageBilling ? (
        <p className="text-sm text-muted-foreground">L&apos;abonnement est géré par le propriétaire du club.</p>
      ) : club.plan === "pro" ? (
        portalUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={portalUrl}>Gérer l&apos;abonnement</a>
          </Button>
        )
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={checkout.isPending} onClick={() => checkout.mutate({ period: "MONTH" })}>
            S&apos;abonner (mensuel)
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={checkout.isPending}
            onClick={() => checkout.mutate({ period: "YEAR" })}
          >
            S&apos;abonner (annuel)
          </Button>
        </div>
      )}
    </Panel>
  );
}

/* ---------- sections ---------- */

function Sections({ data }: { data: ClubAdmin }) {
  const [creating, setCreating] = useState(false);
  return (
    <Panel
      title={`Sections (${data.sections.length})`}
      action={
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus /> Nouvelle section
        </Button>
      }
    >
      <ul className="grid gap-3 md:grid-cols-2">
        {data.sections.map((section) => (
          <SectionCard key={section.id} section={section} sectionCount={data.sections.length} />
        ))}
      </ul>
      <SectionFormDialog open={creating} onOpenChange={setCreating} />
    </Panel>
  );
}

function SectionCard({ section, sectionCount }: { section: ClubAdminSection; sectionCount: number }) {
  const [dialog, setDialog] = useState<"edit" | "code" | null>(null);
  const remove = useActionMutation(deleteSection, { invalidate });
  const deleteError = deleteSectionError({ memberCount: section.memberCount }, sectionCount);
  const close = (open: boolean) => !open && setDialog(null);

  return (
    <li className="space-y-2 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{section.name}</p>
          <p className="text-xs text-muted-foreground">
            {sectionCategoryLabels[section.category]} · {teamLevelLabels[section.level]} · {section.memberCount}{" "}
            membre{section.memberCount > 1 ? "s" : ""}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions de la section ${section.name}`}>
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDialog("edit")}>
              <Pencil className="size-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDialog("code")}>
              <KeyRound className="size-4" /> Code d&apos;invitation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={deleteError !== null || remove.isPending}
              onClick={() => confirm(`Supprimer la section ${section.name} ?`) && remove.mutate(section.id)}
            >
              <Trash2 className="size-4" /> Supprimer
            </DropdownMenuItem>
            {deleteError && <DropdownMenuLabel className="max-w-56 text-xs font-normal">{deleteError}</DropdownMenuLabel>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="font-mono text-sm">{section.inviteCode ? formatInviteCode(section.inviteCode) : "Pas de code"}</p>
      <SectionFormDialog
        open={dialog === "edit"}
        onOpenChange={close}
        section={{ id: section.id, name: section.name, category: section.category, level: section.level }}
      />
      <InviteCodeDialog
        open={dialog === "code"}
        onOpenChange={close}
        code={section.inviteCode}
        teamId={section.id}
        sectionName={section.name}
      />
    </li>
  );
}

/* ---------- members ---------- */

function Members({ data }: { data: ClubAdmin }) {
  return (
    <Panel title={`Membres (${data.members.length})`}>
      <ul className="divide-y">
        {data.members.map((member) => (
          <MemberRow key={member.id} member={member} data={data} />
        ))}
      </ul>
    </Panel>
  );
}

type Confirm = { title: string; text: string; run: () => void } | null;

function MemberRow({ member, data }: { member: ClubAdminMember; data: ClubAdmin }) {
  const [confirmation, setConfirmation] = useState<Confirm>(null);
  const refreshAll = useRefreshAll();
  const sectionName = new Map(data.sections.map((section) => [section.id, section.name]));
  const me = { userId: data.myUserId, clubRole: data.myRole };
  const target = { userId: member.userId, clubRole: member.role };

  const setRole = useActionMutation(setClubRole, { invalidate });
  const setSection = useActionMutation(setSectionMembership, { invalidate });
  const remove = useActionMutation(removeClubMember, { invalidate });
  // The caller loses the owner role: every permission changes.
  const transfer = useActionMutation(transferOwnership, { onSuccess: () => refreshAll() });

  // Same rules as the server (features/clubs/rules.ts): only what is allowed is offered.
  const canSetClubRole = clubRoleChangeError(me, target, "ADMIN") === null;
  const canTransfer = transferOwnershipError(me, target) === null;
  const canManageSections = sectionRoleChangeError(me, target) === null;
  const canRemove = removeMemberError({ ...me, coachesSection: false }, { ...target, sectionRole: "NO_CLUB" }) === null;
  const hasActions = canSetClubRole || canTransfer || canManageSections || canRemove;
  const pending = setRole.isPending || setSection.isPending || remove.isPending || transfer.isPending;

  return (
    <li className="flex items-center gap-3 py-3">
      <InitialsAvatar name={member.name} src={member.image} className="size-9 text-xs" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          <span className="truncate">{member.name}</span>
          {member.role !== "MEMBER" && (
            <Badge variant={member.role === "OWNER" ? "default" : "outline"}>
              {member.role === "OWNER" ? <Crown className="size-3" /> : <Shield className="size-3" />}
              {clubRoleLabels[member.role]}
            </Badge>
          )}
        </p>
        <p className="flex flex-wrap gap-1">
          {member.sections.map((section) => (
            <Badge key={section.teamId} variant="secondary" className="font-normal">
              {sectionName.get(section.teamId)} · {teamRoleLabels[section.role]}
            </Badge>
          ))}
        </p>
      </div>

      {hasActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" disabled={pending} aria-label={`Actions pour ${member.name}`}>
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>{member.name}</DropdownMenuLabel>
            {canManageSections &&
              data.sections.map((section) => {
                const current = member.sections.find((s) => s.teamId === section.id);
                return (
                  <DropdownMenuSub key={section.id}>
                    <DropdownMenuSubTrigger>
                      {section.name}
                      {current && <span className="ml-auto text-xs text-muted-foreground">{teamRoleLabels[current.role]}</span>}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {(["COACH", "PLAYER"] as const).map((role) => (
                          <DropdownMenuItem
                            key={role}
                            disabled={current?.role === role}
                            onClick={() => setSection.mutate({ clubMemberId: member.id, teamId: section.id, role })}
                          >
                            {role === "COACH" ? "Entraîneur" : "Joueur"}
                          </DropdownMenuItem>
                        ))}
                        {current && member.sections.length > 1 && (
                          <DropdownMenuItem
                            onClick={() => setSection.mutate({ clubMemberId: member.id, teamId: section.id, role: null })}
                          >
                            Retirer de la section
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                );
              })}
            {canSetClubRole && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setRole.mutate({ clubMemberId: member.id, role: member.role === "ADMIN" ? "MEMBER" : "ADMIN" })
                  }
                >
                  <Shield className="size-4" />
                  {member.role === "ADMIN" ? "Retirer administrateur" : "Nommer administrateur"}
                </DropdownMenuItem>
              </>
            )}
            {canTransfer && (
              <DropdownMenuItem
                onClick={() =>
                  setConfirmation({
                    title: `Transférer le club à ${member.name} ?`,
                    text: "Il devient propriétaire (et paie l'abonnement du club). Vous restez administrateur.",
                    run: () => transfer.mutate(member.id),
                  })
                }
              >
                <Crown className="size-4" /> Transférer la propriété
              </DropdownMenuItem>
            )}
            {canRemove && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() =>
                    setConfirmation({
                      title: `Retirer ${member.name} du club ?`,
                      text: "Il quitte toutes ses sections et les salons du club.",
                      run: () => remove.mutate(member.id),
                    })
                  }
                >
                  <UserMinus className="size-4" /> Retirer du club
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AlertDialog open={confirmation !== null} onOpenChange={(open) => !open && setConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmation?.text}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmation?.run()}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
