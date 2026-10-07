import { prisma } from "@/prisma";
import { generateInviteCode } from "../invite-code";

/** A new invite code, unique among sections (also enforced by a unique index). */
export async function newInviteCode() {
  for (;;) {
    const code = generateInviteCode();
    const taken = await prisma.team.findFirst({ where: { inviteCode: code }, select: { id: true } });
    if (!taken) return code;
  }
}
