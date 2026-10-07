# Security audit: FootHubGo

- **Date:** 2026-10-07
- **Scope:** Next.js 16.4.0 / Prisma 7.10 / better-auth 1.7.7 / Socket.IO 4.8.4 on the current working tree.
- **Method:** I read the code by hand, checked the better-auth sources in `node_modules`, and ran `bun audit`. Nothing was changed in the code.
- **Severity counts:** 0 critical, 4 high, 5 medium, 17 low.

Every finding below comes from reading the code. Items marked **to verify** depend on the deployment or on a product decision.

---

## 0. Status (branch `fix/security-and-launch-blockers`, then lot 2 `feat/clubs-and-sections` for L6 / L13)

Fixed = done in this branch. Partial = the main risk is fixed, the rest is listed. Deferred = not done, with the reason.

| ID | Status | What was done / why deferred |
|---|---|---|
| H1 | Fixed | 12-character codes (31-symbol alphabet, Web Crypto, no modulo bias), unique index; migration replaces the old 6-digit codes (shared codes stop working, the coach shares the new one). `joinTeamWithCode`: 5 attempts per user and 20 per IP per 10 min. Expiry and usage cap not added (the coach can regenerate or delete the code). |
| H2 | Fixed | `disabledPaths: ["/update-user", "/change-password", "/change-email"]`. Avatars: only `avatars/<sessionUserId>/<file>` on the exact bucket host is deleted (`ownedAvatarKey`, tested); account deletion lists and deletes the user's own prefix. |
| H3 | Fixed | `server.ts` resolves the client IP once (TCP peer, or `TRUSTED_IP_HEADER` set by the proxy) into `x-foothubgo-client-ip`, overwriting any client value; better-auth uses only that header. Per-account lockout (10 sign-ins without success in 15 min). Compose publishes `127.0.0.1:3000`; proxy setup in `README.Docker.md`. Rate-limit storage stays in memory: one instance only (documented). |
| H4 | Fixed | `overrides`: engine.io 6.6.11, engine.io-client 6.6.7, socket.io-parser 4.2.7, ws 8.22.0. `maxHttpBufferSize: 16 kB`, `connectTimeout: 10 s`. `bun audit` now lists only braces and deepmerge-ts (dev/build tools, see L16). Adding `bun audit` to CI: deferred (it would fail on those two). |
| M1 | Fixed | `getMyTeam`: injury type, dates and description only for the coach; players get `isInjured`. |
| M2 | Fixed | Current-password checks: 5 attempts per user per 15 min, counted before the argon2 check; the 5th failure revokes every session and socket. `updateName` returns before the check when the name is unchanged. |
| M3 | Fixed | Two-step change: a 6-digit code (HMAC-hashed in `verification`, 10 min, 3 attempts, 3 requests per hour) is sent to the new address; the change happens only after it is typed back, `emailVerified` becomes true. Emails lowercased in `emailSchema` and by migration. A unique index on `lower(email)` is not added (Prisma cannot describe it, `migrate diff` would drop it); case-insensitive lookups are used instead. |
| M4 | Fixed | `disconnectUserSockets(userId, sessionId?)`: password change, email change, password-limit revocation, account deletion, admin deletion; sign-out closes the sockets of that session (better-auth `session.delete.after` hook). Periodic re-check of open sockets: deferred. |
| M5 | Fixed | `lib/security-headers.ts`: CSP (`default-src 'self'`, no plugins, `frame-ancestors 'none'`, `base-uri`/`form-action 'self'`, `connect-src` self + app WebSocket), HSTS in production, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `poweredByHeader: false`. Scripts keep `'unsafe-inline'` (Next.js inline scripts); a nonce needs a proxy and dynamic rendering everywhere: deferred. `img-src https:` because the bucket and OAuth hosts are not known at build time. Checked in Chromium on a production build: no CSP violation. |
| L1 | Fixed | 8 to 128 characters (better-auth and zod). HIBP check not added. |
| L2 | Deferred | Sign-up email verification / neutral sign-up response: product decision (adds a step to sign-up). |
| L3 | Partial | `stripe_event` table: each event id is claimed before handling, retries are no-ops, a failure releases the claim. The Checkout email fallback only matches verified addresses. `event.created` ordering and `current_period_end` as end date: deferred (the plan gates nothing yet). |
| L4 | Partial | Type detected from magic bytes (`lib/image-type.ts`), extension and Content-Type from the detected type, `ContentDisposition: inline`, cache headers, 10 uploads per hour. Re-encoding with `sharp` (EXIF/GPS strip, resize): deferred (new native dependency). |
| L5 | Fixed | A former member is removed from the team's GROUP conversations (admin handed over to the longest-standing member) and can no longer send in a PRIVATE conversation without a shared current team (history stays readable). |
| L6 | Fixed (lot 2) | Clubs have one OWNER (partial unique index) and ADMINs. Club deletion, club roles and ownership transfer: OWNER only; club info, sections, coach appointments, member removal: OWNER / ADMIN, and an ADMIN only acts on plain members (`features/clubs/rules.ts`, tested). A coach only manages their section (events, call-ups, positions, removing its players). |
| L7 | Fixed | Leaderboard excludes PRIVATE teams, except the viewer's own. |
| L8 | Accepted | Players keep seeing that a teammate is injured on match day (same rule as M1: status yes, details no). |
| L9 | Fixed | Admin deletion refuses to leave a team without a coach (`leavesTeamWithoutCoach`, tested), deletes avatars, closes sockets, clears the name/photo in others' notifications. |
| L10 | Partial | "Delete for everyone" erases `content`; account deletion clears `fromUserName` / `fromUserImage`. Deleting the Stripe customer: deferred (billing flow to be reworked for club subscriptions). |
| L11 | Partial | `allowRequest` refuses a foreign `Origin`, `chat:join` limited to 30 per 10 s per socket. Cap on sockets per user: deferred. |
| L12 | Fixed | Injury type ≤ 50, description ≤ 500 characters. |
| L13 | Fixed (lot 2) | `club_member.userId` is unique (one club per user) and `MembreEquipe (userId, equipeId)` is unique; a section membership requires the club membership (composite FK). `createClub`, `joinTeamWithCode`, `reviewJoinRequest` and coach appointments insert inside a transaction and map the unique violation (P2002) to a clear message. The migration keeps the oldest membership of a user who was in two teams. |
| L14 | Fixed | `loggableError()`: Prisma errors are logged by name and code only. |
| L15 | Deferred | Per-participant deletion of private conversations: UX change, planned with the chat refactor. |
| L16 | Partial | `defu` 6.1.7 and `mysql2` 3.24.5 through `overrides`. `braces` (no patched release) and `deepmerge-ts` (major upgrade inside Prisma) are dev/build only. |
| L17 | Partial | Shared `lib/rate-limit.ts`; budgets on join requests (10/h), polls (20/h), conversations (20/h), avatars (10/h). The chat limit is still count-then-insert (DB-based, a parallel burst can exceed it slightly). |
| L18 | Fixed | `remotePatterns` reduced to the OAuth avatar hosts and the bucket hosts. |

Rate limits are in memory (`lib/rate-limit.ts`): correct for the single-process deployment, reset on restart, not shared between instances.

---

## 1. Findings

| ID | Sev. | Location | Exploit scenario | Fix |
|---|---|---|---|---|
| H1 | **high** | `features/team/actions.ts:22-28`, `:118-142`; `features/team/schemas.ts:24-26` | Invite codes have only 6 digits (900k values), never expire, and `joinTeamWithCode` has no rate limit. A script that replays the server action, or uses several accounts, can enumerate codes and join a **PRIVATE** team. Once in, the attacker sees the members, the active injuries (see M1), the events and the whole team chat history. | Rate limit `joinTeamWithCode` per user and per IP, for example 5 attempts per 10 min stored in the DB or Redis, and lock out after repeated failures. Use longer codes: 10 or more characters of base32 from `randomBytes`. Add an expiry (`inviteCodeExpiresAt`) and an optional usage cap. Add a `@unique` constraint on `Team.inviteCode`. |
| H2 | **high** | better-auth `POST /api/auth/update-user` (enabled by default, unused by the app); `lib/s3.ts:22-29`; `features/settings/actions.ts:145-148`, `:153-169`, `:103` | Any signed-in user can call `/api/auth/update-user` with `{ image: "https://<bucket>.<s3-host>/avatars/<victimId>/<uuid>.png" }`. Teammates and chat participants can see that URL. A following `removeAvatar` or `uploadAvatar` (or `deleteAccount`) passes the URL to `deleteStoredAvatar`, which runs `DeleteObject` on the **victim's object**, or on any key in the bucket. The bucket name `boilerplategogo` suggests it may be shared with other apps (**to verify**). The same endpoint also bypasses the app's checks on `name` (length rules, `NAME_TAKEN` check, notification email). It also accepts an `image` on any host: other members' browsers then load that URL (tracking, IP leak). `next/image` in `NotificationAvatar` throws on hosts that are not allow-listed, which breaks the notification list of the people who receive it. | In `auth.ts`, set `disabledPaths: ["/update-user"]`. Also disable `"/change-password"`, which duplicates `updatePassword` without its email and full session revocation. In `deleteStoredAvatar`, only delete keys that start with `avatars/${userId}/`, where `userId` is the session user. In `objectKeyFromUrl`, check the full host (`=== \`${S3_BUCKET}.${endpointHost}\``) and the path prefix. |
| H3 | **high** (**to verify** for the proxy) | `auth.ts:37` (`rateLimit` without `advanced.ipAddress`); `docker-compose.yaml:33-34` (app published directly on :3000) | better-auth takes the client IP from `x-forwarded-for` (`@better-auth/core/dist/utils/ip.mjs:196-218`). If the app is exposed directly, as in the compose file, the client sets that header, so each request gets a fresh bucket. The limits on `/sign-in` (3 per 10 s) and on OTP requests can then be bypassed, which allows password brute force or credential stuffing against 6-character passwords. If the app sits behind a proxy that *appends* to the header, the IP resolves to `null` and **all** users share one bucket per path. Anyone can then lock everybody out of sign-in. | Put the app behind a reverse proxy and set `advanced.ipAddress.ipAddressHeaders` (for example `["fly-client-ip"]` or `["x-real-ip"]`) or `trustedProxies`. Do not publish :3000 directly. Use `rateLimit.storage: "database"` (or Redis) if more than one instance runs. Add a per-account lockout on failed sign-ins (a `hooks.after` on `/sign-in/email`). |
| H4 | **high** | `package.json` (`socket.io ^4.8.4`) → `engine.io@6.6.4`, `socket.io-parser@4.2.4`, `ws@8.17.1` | `bun audit` reports several pre-authentication DoS advisories. The engine.io handshake and the parser run **before** the `io.use` auth middleware, so any visitor can trigger them. Advisories: GHSA-r635-g3xr-vw7x (polling connection exhaustion), GHSA-2gc4-cqfq-p2gv (protocol mismatch), GHSA-2m8v-j782-fhvr and GHSA-677m-j7p3-52f9 (parser attachments), GHSA-96hv-2xvq-fx4p (ws fragments). | `bun update socket.io socket.io-client` (or add `overrides` for `engine.io>=6.6.10`, `socket.io-parser>=4.2.7`, `ws>=8.21.0`), then run `bun audit` again in CI. Set `maxHttpBufferSize: 64_000` and `connectTimeout` on `new Server(...)`. |
| M1 | medium | `features/team/server/queries.ts:19-22` (`GET /api/me/team`) | Every member, including players, receives the **type and description of each teammate's active injury**. That is health data. It contradicts the rule enforced in `app/api/injuries/players/[userId]/route.ts:7` ("a coach those of their team's players"). | When the caller is not a coach, select only `isInjured` (or `injuries: { select: { id: true } }`). Return `type`, `description` and the dates only to the coach and to the player concerned. |
| M2 | medium | `features/settings/server/password.ts:21-33`, used by `features/settings/actions.ts:35,52,74,91` | Password checks in the settings actions have no rate limit. With a stolen session cookie, an attacker can brute-force the current password through `updateName`: it checks the password and then returns "Pseudo inchangé", so it is a clean oracle with no side effect. The attacker can then change the email or password. Each call also runs argon2 (19 MiB, about 50 ms), so the endpoint can be used for CPU or memory DoS. | Count failed attempts per user (a DB table or Redis), for example 5 per 15 min. After that, refuse and revoke sessions. Send `updateName` to the cheap path first (`name === user.name` → return before checking the password). |
| M3 | medium | `features/settings/actions.ts:50-70`; `features/auth/schemas.ts:4-8` | `updateEmail` stores the new address **without proving ownership** and **without lowercasing it**. Users can squat someone else's address: the real owner then gets "account not linked" when signing in with Google, and app emails go to that mailbox. Postgres `@unique` is case-sensitive, so `Victim@x.com` can be stored next to `victim@x.com`. better-auth looks emails up in lowercase (`sign-in.mjs:318`), so a user who saves an address with capitals can no longer sign in with a password. | Lowercase the email in `emailSchema` (`.toLowerCase()`). Replace the direct update with a verified flow: the emailOTP `change-email` type, or better-auth `user.changeEmail` with `sendChangeEmailVerification`, and update only after the code is confirmed. Add a unique index on `lower(email)`. |
| M4 | medium | `server/realtime/index.ts:20-36` | The socket is authenticated once, at the handshake. After sign-out, a password or email change (`revokeSessions`), or an admin deletion, a socket that is already open (for example an attacker's) keeps receiving `notification:new`, `chat:message`, typing and presence events until it disconnects. | When sessions are revoked, also run `io.in(userRoom(userId)).disconnectSockets(true)`: add this to `revokeSessions`, `deleteAccount`, `deleteUsers` and a `hooks.after` on `/sign-out`. Optionally, re-check the session periodically (every 5 to 10 min) and on `chat:join`. |
| M5 | medium | `next.config.ts` (no `headers()`, `poweredByHeader` left at default) | There is no CSP, no `frame-ancestors` or `X-Frame-Options`, no HSTS, no `X-Content-Type-Options`, no `Referrer-Policy` and no `Permissions-Policy`. The settings page can be framed for clickjacking: a social-only account deletes itself with one confirmation and no password (`deleteAccount` with `required: false`). Without a CSP, any future XSS has no second line of defence. | Add `async headers()` for `/:path*` with: `Content-Security-Policy` (`default-src 'self'; img-src 'self' data: https://<bucket host> https://avatars.githubusercontent.com https://lh3.googleusercontent.com; connect-src 'self' wss://<host>; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`, with a nonce for scripts), `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Set `poweredByHeader: false`. |
| L1 | low | `auth.ts:19-20`; `features/auth/schemas.ts:10-13` | The password policy is 6 to 35 characters. Short passwords make H3 and M2 more effective, and the 35-character cap blocks passphrases. | Use `minPasswordLength: 8` (or more), raise the max to 128, and optionally check passwords against HIBP. |
| L2 | low | `auth.ts:16-24` (no `requireEmailVerification`); `features/auth/auth-error.ts:4` | Sign-up returns `USER_ALREADY_EXISTS`, so anyone can test whether an email is registered. Sign-up also accepts addresses that are never verified: someone can squat an email, and the welcome email goes to a third party (mail bombing, limited by H3). | Return a neutral sign-up response, or require email verification (emailOTP `email-verification`) before the account is active. |
| L3 | low | `app/api/webhooks/stripe/route.ts:26-38`; `features/billing/server/webhook-handlers.ts:42-82` | `event.id` is not stored for deduplication, and the order of events is not checked. When Stripe retries `checkout.session.completed`, the subscription dates are reset and the confirmation email is sent again. If `client_reference_id` is missing, the user is matched by the email typed in Checkout, which is unverified, so that user gets attached to the payer's `customer`. Impact is limited because `plan` gates no feature today. The signature check is correct. | Add a `StripeEvent` table (`id` as PK, inserted with `ON CONFLICT DO NOTHING` before handling). Compare `event.created` with the last update. Always send `client_reference_id`, and drop the email fallback (or match only `emailVerified` users). Take `endDate` from `current_period_end`. |
| L4 | low | `features/settings/actions.ts:116-143` | The MIME type and extension are trusted from the browser and the bytes are not inspected. EXIF metadata, including phone GPS, is kept in a **public** bucket. | Detect the type from magic bytes (`file-type`) and re-encode with `sharp` (strip metadata, cap the size to 512 px). Drop GIF, or re-encode it. Set `ContentDisposition: inline` and `CacheControl`. |
| L5 | low (**to verify** intent) | `features/chat/server/access.ts:9-19`; `features/chat/actions/messages.ts:13-15` | `requireParticipant` only checks team membership for TEAM channels. A kicked or departed player keeps reading and posting in groups and DMs with members of the old team (`sendMessage` only calls `requireUser`). | On `syncChatOnMemberLeft`, remove the user from the team's GROUP conversations (or lock them). Optionally require a shared current team for PRIVATE sends. |
| L6 | low (**to verify** intent) | `features/team/actions.ts:94-98`, `:194-202` | Any co-coach can demote the other coaches (only their own role is protected) and delete the whole club. | Add an `owner` (the creator) who alone can delete the team or demote coaches, or require 2 coaches to confirm. |
| L7 | low | `features/stats/server/queries.ts:13-22` (`GET /api/stats/teams`) | The leaderboard lists **PRIVATE** teams (name, logo, results), even though the directory hides them. | Filter with `where: { visibility: { not: "PRIVATE" } }`, or include the caller's own team only. |
| L8 | low (**to verify** intent) | `features/call-ups/server/queries.ts:45` (`GET /api/events/:id/call-ups`) | Players see whether each teammate is injured on match day, which is health status. | Return `isInjured` only when `isCoach`, or only for the caller. |
| L9 | low | `features/admin/actions.ts:19-32` | `deleteUsers` does not delete S3 avatars and does not handle teams: deleting the only coach leaves a team nobody can manage. | Reuse the `deleteAccount` clean-up (`deleteStoredAvatar`, plus promote another member or refuse when the user is the last coach). |
| L10 | low | `features/chat/actions/messages.ts:57`; `features/notifications/server/notify-user.ts:21-30`; `features/billing/server/subscriptions.ts:4-7` | Data retention after deletion: "delete for everyone" keeps `content` in the DB. Other users' notifications keep `fromUserName` and `fromUserImage` after the account is deleted. The Stripe customer, with name and email, is never deleted. | Set `content: ""` when `deletedForAll` is set. Null `fromUser*` in `deleteAccount` (`updateMany` on the user's name and image). Call `stripe.customers.del` (or anonymise the customer) on account deletion. |
| L11 | low | `server/realtime/index.ts:11-16`; `server/realtime/handlers/chat.ts:33-46` | Socket.IO CORS only covers HTTP polling: the WebSocket upgrade has no `Origin` check, so protection against cross-site WebSocket hijacking rests on SameSite=Lax alone. `chat:join` runs one DB query per event with no throttle, and the number of sockets per user is not capped. | Add `allowRequest: (req, cb) => cb(null, req.headers.origin === process.env.NEXT_PUBLIC_URL)`. Throttle `chat:join` (for example 20 per 10 s per socket) and cap the number of sockets per user. |
| L12 | low | `features/injuries/schemas.ts:8-9` | `type` and `description` have no maximum length. One action can store about 3 MB of text, which every coach then loads. | Add `.max(50)` / `.max(500)`. |
| L13 | low | `prisma/schema.prisma` (`TeamMember`: `@@unique([userId, teamId])` only); `features/team/actions.ts:61-73`, `:118-130`; `features/join-requests/actions.ts:107-111` | The "one team per user" rule only exists in code (check, then insert). Concurrent `joinTeamWithCode`, `createTeam` and `reviewJoinRequest` calls can make a user a member of two teams, and `findMembership` then picks one arbitrarily. | Add `@unique` on `TeamMember.userId` (in a migration) and map P2002 to an `AppError`. |
| L14 | low (**to verify**) | `lib/actions/action.ts:38`; `lib/api/route.ts:36` | Raw errors are logged. A `PrismaClientValidationError` includes the full query with its arguments, which can contain emails, message text or password hashes. | Log `error.name`, `error.code` and `error.message`, and leave out `meta` and the query. Or redact with a logger such as pino with `redact`. |
| L15 | low | `features/chat/actions/conversations.ts:78-98` | Either participant can **delete a whole private conversation for both sides**, which lets a harasser erase the evidence. | For PRIVATE conversations, delete only the caller's participant row and their messages through `MessageDeletion`. Delete the conversation only once both participants have left. |
| L16 | low | `bun audit`: `defu<=6.1.4` (via better-auth, prototype pollution), `mysql2<3.22` (unused transitive dependency of better-auth and prisma), `braces`, `deepmerge-ts` (dev and build) | These are reachable only if untrusted input reaches those paths, which I did not observe. | Run `bun audit fix` and add `overrides` for `defu>=6.1.5`. |
| L17 | low | All server actions except `sendMessage` (`features/**/actions.ts`); `features/chat/server/rate-limit.ts:11-17` | Write actions have no rate limit. For example, a send / cancel loop on `sendJoinRequest` spams coaches with notifications, and groups, polls (one notification per member) and uploads can be mass-created. The chat limit counts and then inserts, so parallel sends bypass it. | Add a shared `rateLimit(key, max, window)` helper (DB or Redis), called from `action()` with a per-action budget. Use an atomic counter for chat. |
| L18 | low | `next.config.ts:33-48` | `images.remotePatterns` allows 13 hosts, including unrelated third-party sites and the whole of `github.com`. `/_next/image` then acts as an open optimising proxy for those hosts (bandwidth and CPU cost). | Keep only the S3 bucket host and the OAuth avatar hosts. |

### Notes (no issue found)

- Every guard **throws** (`lib/auth/session.ts`). Every action and route starts with one, and roles are read from the DB (`requireAdmin`).
- `action()` and `route()` only return `AppError` messages, with a generic message for everything else. No stack traces or internals reach the client.
- The Stripe webhook verifies its signature with `constructEvent` on the raw body.
- Password reset by emailOTP: OTPs are stored hashed, a code allows 3 attempts, `disableSignUp` is set, the reset revokes all sessions, and the "forgot password" response does not reveal whether the account exists.
- OAuth account linking requires a locally verified email (`requireLocalEmailVerified` defaults to true), so unverified sign-ups cannot pre-hijack an account through Google.
- No secrets in the repository or its history (I grepped for `sk_live|sk_test_…|whsec_…|AKIA|re_…|GOCSPX|ghp_`; only placeholders turned up). `.env*` files are in `.gitignore` and `.dockerignore`.

---

## 2. Authorization matrix

OK means the caller is authenticated, every id from the client is scoped to the caller's team, conversation or own records, and the role is checked.

### Server actions (55)

| Action | Guard | Verdict |
|---|---|---|
| admin `changeUserRole`, `deleteUsers` | `requireAdmin` (DB role), cannot target self | OK (L9 for deletion completeness) |
| call-ups `sendCallUps` | `requireCoach`; event and players filtered by `membership.teamId` | OK |
| call-ups `cancelCallUp` | `requireCoach`; `event.teamId` | OK |
| call-ups `replyToCallUp` | `requireMember`; `userId: user.id` + team; conditional update | OK |
| events `createEvent` | `requireCoach`; teamId taken from the session | OK |
| events `updateEvent`, `moveEvent`, `deleteEvent` | `requireCoach`; `findEditableEvent(eventId, teamId)`; `deleteMany` scoped by team | OK |
| events `setAttendance` | `requireMember` + PLAYER; event scoped by team | OK |
| injuries `reportInjury` | `requireMember` + PLAYER; teamId taken from the session | OK (L12) |
| injuries `updateInjury`, `deleteInjury` | `requireUser`; `findOwnInjury(id, user.id)` | OK (L12) |
| join-requests `sendJoinRequest` | `requireUser`; PUBLIC team only; max 3 pending | OK (L17 for spam) |
| join-requests `updateJoinRequest`, `cancelJoinRequest` | `requireUser`; `findOwnRequest` | OK |
| join-requests `reviewJoinRequest` | `requireCoach`; request scoped by `team.id`; status updated in a transaction | OK (L13 for the race) |
| notifications `markNotificationRead`, `markAllNotificationsRead` | `requireUser`; `userId` filter | OK |
| polls `createPoll`, `closePoll`, `deletePoll` | `requireCoach`; `findTeamPoll` | OK |
| polls `vote` | `requireMember`; `findTeamPoll`; choices validated against the poll options | OK |
| settings `updateName`, `updateEmail`, `updatePassword`, `deleteAccount` | `requireUser`; current password | **ISSUE** M2 (no rate limit), M3 (email) |
| settings `uploadAvatar`, `removeAvatar` | `requireUser`; key generated on the server | **ISSUE** H2 (key derived from a user-controlled `image`), L4 |
| stats `createTeamStats`, `updateTeamStats`, `deleteTeamStats` | `requireCoach`; `findTeamMatch(eventId, teamId)` | OK |
| stats `createPlayerStats` | `requireCoach`; player must be in the team and have a CONFIRMED call-up | OK |
| stats `updatePlayerStats`, `deletePlayerStats` | `requireCoach`; `findTeamPlayerStat` (`event.teamId`) | OK |
| team `createTeam` | `requireUser`; must not already be in a club | OK (L13) |
| team `updateTeam`, `deleteTeam`, `regenerateInviteCode`, `removeInviteCode` | `requireCoach`; teamId taken from the session | OK (L6 for co-coaches) |
| team `joinTeamWithCode` | `requireUser`; 6-digit code | **ISSUE** H1 |
| team `leaveTeam` | `requireMember`; membership taken from the session | OK |
| team `removeMember`, `updateMemberRole`, `updateMemberPosition` | `requireCoach`; `findTeamMember(memberId, teamId)` | OK (L6) |
| chat `createConversation` | `requireMember`; `assertTeammates`; `assertNotBlocked` | OK |
| chat `pinConversation` | `requireUser`; `userId` filter | OK |
| chat `deleteConversation` | `requireUser`; `requireParticipant`; TEAM channel forbidden; GROUP admin only | OK (L15) |
| chat `setUserBlocked` | `requireUser` | OK |
| chat `renameGroup`, `addGroupMembers`, `removeGroupMember` | `requireGroupAdmin` / `requireParticipant`; new members must be teammates | OK |
| chat `sendMessage` | `requireUser`; `requireParticipant`; block check; 15 messages/min | OK (L5, L17 race) |
| chat `deleteMessage` | `requireUser`; participant; "all" only by the sender | OK (L10) |
| chat `markConversationRead` | `requireUser`; `requireParticipant` | OK |

### Lot 2 (clubs and sections): new and changed actions

| Action | Guard | Verdict |
|---|---|---|
| clubs `createClub` | `requireUser`; one club per user (unique index, P2002 mapped) | OK |
| clubs `updateClub`, `createSection`, `updateSection`, `deleteSection` | `requireClubPermission` (OWNER / ADMIN); section looked up in the caller's club; only an empty section, never the last one | OK |
| clubs `deleteClub` | OWNER only; Stripe subscription cancelled first | OK |
| clubs `setClubRole`, `transferOwnership` | OWNER only (`clubRoleChangeError`, `transferOwnershipError`); conditional demote-then-promote in a transaction | OK |
| clubs `setSectionMembership`, `removeClubMember` | OWNER / ADMIN on lower ranks (`sectionRoleChangeError`, `removeMemberError`); ids looked up in the caller's club | OK |
| clubs `switchSection` | `requireMember`; the section must be one of the caller's | OK |
| team `regenerateInviteCode`, `removeInviteCode` | `requireSectionManager(teamId?)` (section coach or OWNER / ADMIN, section of the caller's club) | OK |
| team `removeMember`, `updateMemberRole` | `removeMemberError` / `sectionRoleChangeError` (L6) | OK |
| events `createEvent`, `updateEvent`, `moveEvent`, `deleteEvent` | `canManageSection(membership, event.teamId)`: section coach or OWNER / ADMIN; club-wide events OWNER / ADMIN only | OK |
| join-requests `reviewJoinRequest` | request in the caller's club and `canManageSection` on its section; claim then `addToSection` (P2002 mapped, claim released on failure) | OK |
| billing `startClubCheckout` | OWNER only; club id in the Checkout metadata | OK |
| GET `/api/club` | OWNER / ADMIN | OK |
| GET `/api/club/join-requests` | manages at least one section; admins see the club's requests, coaches their sections' | OK |

### GET routes (24, plus better-auth)

| Route | Guard | Verdict |
|---|---|---|
| `/api/admin/stats`, `/api/admin/users` | `requireAdmin`; filters validated with zod | OK |
| `/api/chat/conversations` | `requireUser`; `participants.some(userId)` | OK |
| `/api/chat/conversations/:id/messages` | `requireUser`; `requireParticipant`; the cursor cannot escape the `conversationId` filter | OK |
| `/api/events`, `/api/events/:id` | `requireMember`; `teamId` | OK |
| `/api/events/:id/call-ups` | `requireMember`; `teamId`; call-up details for the coach only | OK (L8) |
| `/api/home` | `requireUser`; membership taken from the session | OK |
| `/api/injuries/team` | `requireCoach` | OK |
| `/api/injuries/players/:userId` | self, or coach with the player in their team, and `teamId` filter | OK |
| `/api/me/attendances`, `/api/me/call-ups`, `/api/me/join-requests`, `/api/me/profile`, `/api/notifications`, `/api/stats/players` | `requireUser`; `userId` from the session | OK |
| `/api/me/team` | `requireUser`; email and invite code for the coach only | **ISSUE** M1 (teammates' injury details) |
| `/api/polls` | `requireMember`; `teamId` | OK |
| `/api/stats/events/:id` | `requireMember`; `teamId` | OK |
| `/api/stats/teams` | `requireUser` | **ISSUE** L7 (PRIVATE teams listed) |
| `/api/stats/teams/:teamId` | `requireMember(teamId)` | OK |
| `/api/teams` | `requireUser`; PRIVATE teams hidden; no invite code | OK |
| `/api/teams/:teamId/join-requests` | `requireCoach(teamId)` | OK |
| `/api/webhooks/stripe` | Stripe signature | OK (L3 for idempotency) |
| `/api/auth/[...all]` (better-auth) | better-auth | **ISSUE** H2 (`/update-user`), H3 (rate-limit IP) |

Pages: `app/app/layout.tsx` uses `requireSignedInPage`, team pages use `requireTeamPage`, and `app/dashboard/*` uses `requireAdminPage`. The pages only gate rendering: the data comes from the guarded GET routes above. OK.

---

## 3. Fix plan (PR-sized batches, in order of severity)

**PR 1: Auth hardening (H2, H3, L1, L2 partly)**
1. `auth.ts`:
   - Add `disabledPaths: ["/update-user", "/change-password"]`.
   - Add `advanced.ipAddress` (the proxy's real client-IP header and `trustedProxies`) and `rateLimit.storage: "database"`.
   - Set `minPasswordLength: 8` and `maxPasswordLength: 128`, and update `passwordSchema` to match.
2. `lib/s3.ts` and `features/settings/actions.ts`:
   - `objectKeyFromUrl` checks the full host and the `avatars/<userId>/` prefix.
   - `deleteStoredAvatar(url, userId)` refuses any other key.
3. Deployment: put a reverse proxy in front of the app and stop publishing `3000:3000` directly. Document the IP header in `README.Docker.md`.

**PR 2: Socket.IO upgrade and realtime session revocation (H4, M4, L11)**
1. Upgrade `socket.io` and `socket.io-client`, or add `overrides` for engine.io, socket.io-parser and ws. Add `bun audit --audit-level=high` to CI.
2. On `new Server`: set `maxHttpBufferSize`, `connectTimeout` and an `allowRequest` origin check.
3. Add `disconnectUser(userId)` in `emitter.ts`. Call it from `revokeSessions`, `deleteAccount`, `deleteUsers` and a better-auth `hooks.after` on `/sign-out`.
4. Throttle `chat:join` and cap the number of sockets per user.

**PR 3: Invite codes and action rate limiting (H1, M2, L17)**
1. Add `lib/rate-limit.ts`, using a DB table or Redis, with an atomic `INSERT … ON CONFLICT … RETURNING count`.
2. `joinTeamWithCode`: rate limit per user and per IP. Codes become 10 or more base32 characters. Add `inviteCodeExpiresAt` and `@unique` on `inviteCode` (migration).
3. `verifyCurrentPassword`: count failures per user and lock out. In `updateName`, return early when the name is unchanged, before checking the password.
4. Budgets for `sendJoinRequest`, `createConversation`, `createPoll` and `uploadAvatar`. Make the chat limit atomic.

**PR 4: Security headers (M5, L18)**
1. `next.config.ts`: add `headers()` with CSP (nonce-based, `frame-ancestors 'none'`, `connect-src` including `wss:`), HSTS, nosniff, Referrer-Policy and Permissions-Policy. Set `poweredByHeader: false`.
2. Trim `images.remotePatterns` down to the bucket and the OAuth avatar hosts.

**PR 5: Health and personal data exposure (M1, L7, L8, L4, L10)**
1. `getMyTeam`: return injury details to the coach only; players get `isInjured`.
2. Call-ups list: return `isInjured` to the coach only (after confirming with the product owner).
3. Leaderboard: exclude PRIVATE teams.
4. Avatars: check magic bytes and re-encode with `sharp`, which strips EXIF.
5. Retention: clear `content` on delete-for-all, null `fromUser*` on account deletion, delete the Stripe customer.

**PR 6: Email change flow (M3, L2)**
1. `emailSchema` lowercases the address. Add a unique index on `lower(email)` (migration, after checking for existing case duplicates).
2. Replace the direct `updateEmail` with a verification flow: send a code to the new address, then update.
3. Optional: require email verification at sign-up and make the sign-up response neutral.

**PR 7: Business-rule and data-integrity hardening (L3, L5, L6, L9, L12, L13, L14, L15, L16)**
1. Stripe: `StripeEvent` dedup table, `event.created` ordering check, drop the email fallback, use the period end from Stripe.
2. Add `@unique` on `TeamMember.userId`. Add max lengths to the injury schema.
3. Chat: on leaving a team, remove the user from that team's groups. Make PRIVATE deletion per participant.
4. Team ownership model for co-coaches (product decision).
5. Admin `deleteUsers` reuses the account-deletion clean-up.
6. Redact error logs. Run `bun audit fix` and add `overrides` for defu.
