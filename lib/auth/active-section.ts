import { cookies } from "next/headers";
import { ACTIVE_SECTION_COOKIE } from "./session";

/**
 * Remembers the active section (server actions only). The value is a hint: `findMembership()`
 * checks it against the user's memberships on every request and falls back to their oldest section.
 */
export async function setActiveSection(teamId: string) {
  (await cookies()).set(ACTIVE_SECTION_COOKIE, teamId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
