import type { Serialized } from "@/lib/types";
import type { getPlayerInjuries, getTeamInjuries } from "./server/queries";

export type PlayerInjury = Serialized<Awaited<ReturnType<typeof getPlayerInjuries>>>[number];
export type TeamInjuryRow = Serialized<Awaited<ReturnType<typeof getTeamInjuries>>>[number];
