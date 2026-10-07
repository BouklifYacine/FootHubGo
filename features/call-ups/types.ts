import type { Serialized } from "@/lib/types";
import type { getEventCallUps, listMyCallUps } from "./server/queries";

export type EventCallUps = Serialized<Awaited<ReturnType<typeof getEventCallUps>>>;
export type EventCallUpPlayer = EventCallUps["players"][number];
export type MyCallUps = Serialized<Awaited<ReturnType<typeof listMyCallUps>>>;
export type MyCallUp = MyCallUps["callUps"][number];
