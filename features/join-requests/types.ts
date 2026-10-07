import type { Serialized } from "@/lib/types";
import type { getManagedJoinRequests, getMyJoinRequests } from "./server/queries";

export type MyJoinRequest = Serialized<Awaited<ReturnType<typeof getMyJoinRequests>>>[number];
export type TeamJoinRequest = Serialized<Awaited<ReturnType<typeof getManagedJoinRequests>>>[number];
