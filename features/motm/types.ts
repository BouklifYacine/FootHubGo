import type { Serialized } from "@/lib/types";
import type { getEventMotm } from "./server/queries";

export type EventMotm = Serialized<NonNullable<Awaited<ReturnType<typeof getEventMotm>>>>;
