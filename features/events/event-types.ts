import type { EventType } from "@/generated/prisma/browser";
import { eventTypeLabels } from "@/lib/enum-labels";

/** Display config of each event type: one place for labels and colors (calendar, badges, filters). */
export const EVENT_TYPES: Record<EventType, { label: string; color: string; badgeClass: string; accentClass: string }> = {
  TRAINING: {
    label: eventTypeLabels.TRAINING,
    color: "#f97316",
    badgeClass: "border-transparent bg-warning/15 text-warning",
    accentClass: "bg-warning",
  },
  LEAGUE: {
    label: eventTypeLabels.LEAGUE,
    color: "#0ea5e9",
    badgeClass: "border-transparent bg-info/15 text-info",
    accentClass: "bg-info",
  },
  CUP: {
    label: eventTypeLabels.CUP,
    color: "#10b981",
    badgeClass: "border-transparent bg-success/15 text-success",
    accentClass: "bg-success",
  },
};

export const EVENT_TYPE_KEYS = Object.keys(EVENT_TYPES) as EventType[];

export const isMatch = (type: EventType) => type !== "TRAINING";
