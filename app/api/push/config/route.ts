import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/prisma";
import { pushConfig } from "@/features/push/server/vapid";

/**
 * Push setup of the signed-in user: the VAPID public key (null = push disabled on this server,
 * read at runtime so the Docker image needs no key at build time) and the number of devices.
 */
export const GET = route(async () => {
  const user = await requireUser();
  const config = pushConfig();
  const devices = await prisma.pushSubscription.count({ where: { userId: user.id } });
  return { publicKey: config?.publicKey ?? null, devices };
});
