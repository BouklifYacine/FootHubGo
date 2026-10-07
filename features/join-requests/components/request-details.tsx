import { CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDateLong } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import {
  joinRequestStatusLabels,
  playerPositionLabels,
  teamLevelLabels,
} from "@/lib/enum-labels";
import { cn } from "@/lib/utils";
import type { JoinRequestStatus, PlayerPosition, TeamLevel } from "@/generated/prisma/browser";

const statusStyles: Record<JoinRequestStatus, { className: string; Icon: typeof Clock }> = {
  PENDING: { className: "bg-amber-50 text-amber-700 border-amber-200/60", Icon: Clock },
  ACCEPTED: { className: "bg-green-50 text-green-700 border-green-200/60", Icon: CheckCircle },
  REJECTED: { className: "bg-red-50 text-red-700 border-red-200/60", Icon: XCircle },
};

export function RequestStatusBadge({ status, className }: { status: JoinRequestStatus; className?: string }) {
  const { className: colors, Icon } = statusStyles[status];
  return (
    <div
      className={cn(
        "flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
        colors,
        className,
      )}
    >
      <Icon className="mr-1 size-3" />
      {joinRequestStatusLabels[status]}
    </div>
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
    <div className="space-y-8 p-8">
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <Detail label="Poste" value={playerPositionLabels[request.position]} />
        <Detail label="Niveau" value={teamLevelLabels[request.level]} />
        <Detail
          label="Date"
          value={formatDateLong(request.createdAt)}
        />
      </div>
      <Separator />
      <div className="rounded-xl border bg-zinc-50 p-5 dark:bg-zinc-900">
        <span className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">
          {motivationLabel}
        </span>
        <p className="text-sm leading-relaxed font-medium text-zinc-600 italic dark:text-zinc-300">
          &quot;{request.motivation}&quot;
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{label}</span>
      <span className="text-base font-bold text-zinc-800 dark:text-zinc-100">{value}</span>
    </div>
  );
}

export function EmptyRequests({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-zinc-50 px-4 py-16 text-center dark:bg-zinc-900/50">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Aucune candidature</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">{text}</p>
    </div>
  );
}
