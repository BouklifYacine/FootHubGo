import type { Metadata } from "next";
import { headers } from "next/headers";
import { getSession, findMembership } from "@/lib/auth/session";
import { clientIpFrom } from "@/lib/client-ip";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { findInviteTarget } from "@/features/team/server/invite-codes";
import { JoinInviteCard } from "@/features/team/components/join-invite";

export const metadata: Metadata = { title: "Invitation", robots: { index: false } };

/**
 * Invite link shared by a coach (`/join/CODE`): shows the club and section. Signed out: sign up or
 * sign in, then come back here (`?next=`). Signed in: one tap to join (a GET never joins by itself).
 */
export default async function JoinCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [session, requestHeaders] = await Promise.all([getSession(), headers()]);
  const target = await findInviteTarget(code, clientIpFrom(requestHeaders));

  let membership: { clubId: string; clubName: string; sectionIds: string[] } | null = null;
  if (session) {
    const found = await findMembership(session.user.id);
    if (found) membership = { clubId: found.clubId, clubName: found.club.name, sectionIds: found.sections.map((s) => s.teamId) };
  }

  return (
    <AuthLayout>
      <JoinInviteCard
        code={code}
        signedIn={Boolean(session)}
        target={target === "rate-limited" || target === null ? null : { ...target, category: target.category }}
        rateLimited={target === "rate-limited"}
        membership={membership}
      />
    </AuthLayout>
  );
}
