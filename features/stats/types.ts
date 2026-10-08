import type { Serialized } from "@/lib/types";
import type { getEventStats, getTeamPlayingTime } from "./server/queries";

export type { PlayerStatsSummary, Standing, TeamStatsSummary } from "./compute";

export type EventStats = Serialized<Awaited<ReturnType<typeof getEventStats>>>;
export type EventTeamStat = NonNullable<EventStats["teamStat"]>;
export type EventPlayerStat = EventStats["playerStats"][number];
export type EligiblePlayer = EventStats["eligiblePlayers"][number];
export type PresentPlayer = EventStats["presentPlayers"][number];
export type TeamPlayingTime = Serialized<Awaited<ReturnType<typeof getTeamPlayingTime>>>;
