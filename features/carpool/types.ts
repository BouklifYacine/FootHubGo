import type { Serialized } from "@/lib/types";
import type { getEventCarpool } from "./server/queries";

export type EventCarpool = Serialized<NonNullable<Awaited<ReturnType<typeof getEventCarpool>>>>;
export type CarpoolRide = EventCarpool["rides"][number];
