import type { Serialized } from "@/lib/types";
import type { getMyJoinRequests, getTeamJoinRequests } from "./server/queries";

export type MyJoinRequest = Serialized<Awaited<ReturnType<typeof getMyJoinRequests>>>[number];
export type TeamJoinRequest = Serialized<Awaited<ReturnType<typeof getTeamJoinRequests>>>[number];
