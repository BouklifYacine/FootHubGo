"use client";

import type { QueryKey } from "@tanstack/react-query";
import type { AttendanceStatus } from "@/generated/prisma/browser";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { attendanceStatusLabels } from "@/lib/enum-labels";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { queryKeys } from "@/lib/query/keys";
import { setAttendance } from "../actions";
import type { EventListItem } from "../types";

const statusClass: Record<AttendanceStatus, string> = {
  PENDING: "",
  PRESENT: "text-green-600",
  ABSENT: "text-red-500",
};

type Props = { eventId: string; value: AttendanceStatus; disabled?: boolean; listKey: QueryKey };

/** A player's attendance to a training, updated optimistically in the list it is shown in. */
export function AttendanceSelect({ eventId, value, disabled, listKey }: Props) {
  const mutation = useActionMutation(setAttendance, {
    invalidate: [queryKeys.events.all],
    optimistic: {
      queryKey: listKey,
      update: (previous, input) =>
        (previous as EventListItem[] | undefined)?.map((event) =>
          event.id === input.eventId ? { ...event, myAttendance: input.status } : event,
        ),
    },
  });

  return (
    <Select
      value={value}
      disabled={disabled || mutation.isPending}
      onValueChange={(status) => mutation.mutate({ eventId, status: status as AttendanceStatus })}
    >
      <SelectTrigger className="w-[140px]" aria-label="Ma présence">
        <SelectValue placeholder="Présence" />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(attendanceStatusLabels) as AttendanceStatus[]).map((status) => (
          <SelectItem key={status} value={status} className={statusClass[status]}>
            {attendanceStatusLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
