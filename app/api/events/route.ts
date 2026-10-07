import { z } from "zod";
import { EventType } from "@/generated/prisma/client";
import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { listEvents } from "@/features/events/server/queries";

const filtersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  type: z.enum(EventType).optional(),
});

export const GET = route(async ({ req }) => {
  const { user, membership } = await requireMember();
  const filters = filtersSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  return listEvents(membership.teamId, user.id, filters);
});
