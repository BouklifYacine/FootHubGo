import { CircleCheck, CircleHelp, CircleX, Users } from "lucide-react";
import type { AttendanceStatus } from "@/generated/prisma/browser";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { playerPositionLabels } from "@/lib/enum-labels";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import type { EventDetail } from "../types";

const statusConfig = {
  PRESENT: { icon: CircleCheck, variant: "success", label: "Vient" },
  ABSENT: { icon: CircleX, variant: "danger", label: "Absent" },
  PENDING: { icon: CircleHelp, variant: "muted", label: "Sans réponse" },
} as const satisfies Record<AttendanceStatus, unknown>;

const order: AttendanceStatus[] = ["PRESENT", "ABSENT", "PENDING"];

/** Who said they will (not) come to a training: one list, coming first (works on any width). */
export function AttendanceTable({ attendances }: { attendances: EventDetail["attendances"] }) {
  if (attendances.length === 0) {
    return <EmptyState icon={Users} title="Personne n'a encore répondu" description="Les joueurs indiquent leur présence depuis l'Agenda ou l'accueil." />;
  }
  const sorted = attendances.toSorted((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {sorted.map((attendance) => {
        const { icon: Icon, variant, label } = statusConfig[attendance.status];
        return (
          <li key={attendance.userId} className="flex items-center gap-3 px-4 py-2.5">
            <InitialsAvatar name={attendance.name} src={attendance.image} className="size-9" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{attendance.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {attendance.position ? playerPositionLabels[attendance.position] : "Poste non renseigné"}
              </span>
            </span>
            <Badge variant={variant}>
              <Icon aria-hidden /> {label}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
