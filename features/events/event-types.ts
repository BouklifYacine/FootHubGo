import type { EventType } from "@/generated/prisma/browser";
import { eventTypeLabels } from "@/lib/enum-labels";

/** Display config of each event type: one place for labels and colors (calendar, badges, filters). */
export const EVENT_TYPES: Record<EventType, { label: string; color: string; badgeClass: string }> = {
  TRAINING: { label: eventTypeLabels.TRAINING, color: "#f97316", badgeClass: "bg-orange-500 text-white" },
  LEAGUE: { label: eventTypeLabels.LEAGUE, color: "#0ea5e9", badgeClass: "bg-sky-500 text-white" },
  CUP: { label: eventTypeLabels.CUP, color: "#10b981", badgeClass: "bg-emerald-500 text-white" },
};

export const EVENT_TYPE_KEYS = Object.keys(EVENT_TYPES) as EventType[];

export const isMatch = (type: EventType) => type !== "TRAINING";
