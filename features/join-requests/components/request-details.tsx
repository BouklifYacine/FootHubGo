import { CircleCheck, Clock, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateLong } from "@/lib/format";
import { joinRequestStatusLabels, playerPositionLabels, teamLevelLabels } from "@/lib/enum-labels";
import type { JoinRequestStatus, PlayerPosition, TeamLevel } from "@/generated/prisma/browser";

const statusBadge: Record<JoinRequestStatus, { variant: "warning" | "success" | "danger"; Icon: typeof Clock }> = {
  PENDING: { variant: "warning", Icon: Clock },
  ACCEPTED: { variant: "success", Icon: CircleCheck },
  REJECTED: { variant: "danger", Icon: CircleX },
};

/** Status of a join request: icon + text. */
export function RequestStatusBadge({ status, className }: { status: JoinRequestStatus; className?: string }) {
  const { variant, Icon } = statusBadge[status];
  return (
    <Badge variant={variant} className={className}>
      <Icon aria-hidden /> {joinRequestStatusLabels[status]}
    </Badge>
  );
}

type Request = {
  position: PlayerPosition;
  level: TeamLevel;
  createdAt: string;
  motivation: string;
};

/** Body of the "see request" dialogs (player and coach side). */
export function RequestDetails({ request, motivationLabel }: { request: Request; motivationLabel: string }) {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-4">
        <Detail label="Poste" value={playerPositionLabels[request.position]} />
        <Detail label="Niveau" value={teamLevelLabels[request.level]} />
        <Detail label="Envoyée le" value={formatDateLong(request.createdAt)} />
      </dl>
      <div className="rounded-xl border bg-muted/50 p-4">
        <p className="mb-1 text-xs font-semibold text-muted-foreground">{motivationLabel}</p>
        <p className="text-sm leading-relaxed whitespace-pre-line">{request.motivation}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
