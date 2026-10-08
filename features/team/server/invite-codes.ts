import { prisma } from "@/prisma";
import { rateLimiter } from "@/lib/rate-limit";
import { generateInviteCode, isInviteCodeFormat, normalizeInviteCode } from "../invite-code";

/** A new invite code, unique among sections (also enforced by a unique index). */
export async function newInviteCode() {
  for (;;) {
    const code = generateInviteCode();
    const taken = await prisma.team.findFirst({ where: { inviteCode: code }, select: { id: true } });
    if (!taken) return code;
  }
}

/** Opening invite links: 30 lookups per IP every 10 minutes (the code is the secret, no guessing). */
const inviteLookupsPerIp = rateLimiter("invite-link-ip", { max: 30, windowMs: 10 * 60_000 });

/**
 * The section an invite link points to (`/join/CODE`), with what the invitee needs to decide:
 * club and section names, logo. `null` for an unknown or malformed code, "rate-limited" when the IP
 * opens too many links.
 */
export async function findInviteTarget(code: string, ip: string) {
  const inviteCode = normalizeInviteCode(code);
  if (!isInviteCodeFormat(inviteCode)) return null;
  if (!inviteLookupsPerIp.hit(ip).ok) return "rate-limited" as const;
  const section = await prisma.team.findFirst({
    where: { inviteCode },
    select: { id: true, name: true, category: true, club: { select: { id: true, name: true, logoUrl: true } } },
  });
  return section ? { ...section, inviteCode } : null;
}
