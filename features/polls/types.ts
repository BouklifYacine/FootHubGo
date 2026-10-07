import type { Serialized } from "@/lib/types";
import type { listPolls } from "./server/queries";

export type Poll = Serialized<Awaited<ReturnType<typeof listPolls>>[number]>;
