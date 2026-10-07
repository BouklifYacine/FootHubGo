import type { Serialized } from "@/lib/types";
import type { getHomeData } from "./server/queries";

export type HomeData = Serialized<NonNullable<Awaited<ReturnType<typeof getHomeData>>>>;
