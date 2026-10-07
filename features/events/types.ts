import type { Serialized } from "@/lib/types";
import type { getEvent, listEvents } from "./server/queries";

export type EventListItem = Serialized<Awaited<ReturnType<typeof listEvents>>[number]>;
export type EventDetail = Serialized<Awaited<ReturnType<typeof getEvent>>>;
