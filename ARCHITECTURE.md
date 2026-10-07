# Architecture

FootHubGo is a Next.js 16 (App Router) app with a custom Node server (`server.ts`) that also hosts Socket.IO.
Data lives in PostgreSQL through Prisma 7. Client state is TanStack Query; forms use TanStack Form + zod.

**Code is in English** (files, identifiers, routes, comments). **UI text is in French** (users are French).

## Data flow — one rule

| Need | Server | Client |
|---|---|---|
| **Read** | `GET` route handler in `app/api/**/route.ts`, wrapped with `route()`, calling a function from `features/<f>/server/queries.ts` | `useQuery({ queryKey: queryKeys.x, queryFn: () => fetchJson(url) })` |
| **Write** | Server action in `features/<f>/actions.ts` (`"use server"`), built with `action(schema, handler)` | `useActionMutation(action, { invalidate: [queryKeys.x] })` |

Exceptions that stay REST: `app/api/auth/[...all]` (better-auth), `app/api/webhooks/stripe` and
`app/api/unsubscribe` (one-click unsubscribe from mail clients, signed token): external callers.

Why: server actions give CSRF protection, end-to-end types and no client fetch layer for writes,
but Next.js queues them one at a time, so reads go through cacheable, parallel `GET` routes.

## Shared building blocks (`lib/`)

| File | Purpose |
|---|---|
| `lib/auth/session.ts` | `requireUser()`, `requireAdmin()`, `findMembership(userId)` (the **active section**, see below), `requireMember(teamId?)`, `requireCoach(teamId?)`, `requireSectionManager(teamId?)`, `requireClubRole(...roles)`, `requireClubPermission(permission)`. They **throw** — never compare against an `undefined` user id. |
| `lib/auth/active-section.ts` | `setActiveSection(teamId)`: writes the active-section cookie (server actions only). |
| `lib/errors.ts` | `AppError(message, status)` + `unauthorized()`, `forbidden()`, `notFound()`. Messages are shown to the user. |
| `lib/api/route.ts` | `route(handler)` for GET handlers: awaits params, returns JSON, maps errors to `{ message }` + status. |
| `lib/actions/action.ts` | `action(zodSchema, handler)` → resolves to `ActionResult` `{ success, message, data? }`, never throws. |
| `lib/api/fetch-json.ts` | `fetchJson<T>(url)` / `withQuery(path, params)` for `queryFn`s. |
| `lib/query/keys.ts` | Every query key (hierarchical). Never write a raw key array in a hook. |
| `lib/query/use-action-mutation.ts` | Toasts + invalidation + optional optimistic update for server actions. |
| `lib/form` | `useAppForm` with `TextField`, `NumberField`, `TextareaField`, `SelectField`, `CheckboxField`, `DateField`, `SubmitButton`. |
| `lib/enum-labels.ts` | French labels for every Prisma enum + `toOptions()` for selects. |
| `lib/types.ts` | `Serialized<T>`: the JSON shape of a server value (Dates become strings). |
| `lib/rate-limit.ts` | `rateLimiter(name, { max, windowMs })` + `enforceRateLimit(...)`: in-memory, one process only. |
| `lib/client-ip.ts` | `clientIpFrom(headers)`: the client IP resolved by `server.ts` (`TRUSTED_IP_HEADER`). |
| `lib/signed-token.ts` | Purpose-bound HMAC tokens (unsubscribe links, hashed one-time codes). |
| `lib/security-headers.ts` | CSP and other security headers set in `next.config.ts`. |

## Clubs and sections

```
Club (club)                       name, logo, description, visibility, plan + Stripe customer (billing)
 ├─ ClubMember (club_member)      club role OWNER | ADMIN | MEMBER — exactly one OWNER (partial unique index)
 │   └─ TeamMember (MembreEquipe) section role COACH | PLAYER — composite FK (clubId, userId) -> club_member
 ├─ Team = SECTION (equipe)       name ("Seniors A"), category SENIOR | VETERAN | LEISURE, level, invite code
 │   └─ events, call-ups, attendances, stats, polls, injuries, join requests, section chat channel
 ├─ Event with teamId = null      club-wide event, visible in every section
 ├─ Conversation type CLUB        club chat channel (every club member)
 └─ Subscription (clubId)         paid by the OWNER
```

- The Prisma model `Team` **is a section** (historical name and table kept to limit churn). Every former team
  became a club with one section of the same id (migration `20261012120100_clubs_and_sections`).
- **One club per user for now**: `club_member.userId` is unique (it also makes concurrent joins safe, audit L13).
  A user can belong to **several sections** of their club (e.g. coach of "Vétérans", player of "Seniors A").
  A club member always has at least one section: leaving / being removed from the last one leaves the club
  (the OWNER must transfer ownership or delete the club first).
- **Active section**: stored in the `fhg-section` cookie (httpOnly), switched with the section switcher
  (`switchSection`). `findMembership()` checks the cookie against the user's memberships on **every** request
  and falls back to their oldest section (`resolveActiveSection`), so a forged or stale cookie is harmless.
  `membership.teamId` / `role` / `team` are the active section's; `membership.clubId`, `club`, `clubRole` and
  `sections` (all the user's sections) come with it.
- **Who can do what** is a pure, tested matrix in `features/clubs/rules.ts` (`CLUB_PERMISSIONS`,
  `canManageSection`, `*Error` rules). Club-level actions (club info, sections, coach appointments, member
  removal, club-wide events) need OWNER / ADMIN; club roles, ownership transfer, billing and club deletion need
  the OWNER. Section-level actions (events, call-ups, stats, polls, invite code, join requests) need a coach of
  the section **or** a club OWNER / ADMIN (`requireSectionManager`), except the existing coach-only screens
  that still use `requireCoach` (call-ups, stats, polls, injuries of the active section).
- Scoping: section data is filtered by `membership.teamId`; club data by `membership.clubId`; events of a
  section are `sectionEventsWhere()` (its own + the club-wide ones). Never trust a section / member id from the
  client: look it up inside the caller's club first.
- **Club-wide events** (`teamId: null`): created / edited by OWNER / ADMIN (event form: "Tout le club" or a
  section). No call-ups, no attendance, no stats; the reminder goes to every club member (information only).
- **Chat**: one CLUB channel (OWNER / ADMIN are channel admins) + one TEAM channel per section, kept in sync by
  `features/team/server/team-chat.ts` (`resyncClubChat`, `syncChatOnMemberJoined`, `syncChatOnClubLeft`…).
  DMs and groups are between members of the same club.
- **Billing**: the subscription belongs to the club and is paid by its OWNER (`startClubCheckout`, club id in the
  Checkout metadata; webhook resolves the club by `stripeCustomerId`). Legacy per-user subscriptions of users who
  owned no club at migration time stay on the user (`User.plan` / `User.clientId`, `Subscription.userId`) and are
  still handled by the webhook. A transfer of ownership keeps the club's Stripe customer (the new owner updates
  the payment method from the customer portal).

## Feature folder

```
features/<feature>/
  actions.ts            "use server" — writes (split into actions/*.ts only when it grows past ~250 lines)
  server/queries.ts     reads used by GET routes and server components (server only)
  hooks/use-*.ts        useQuery / useActionMutation wrappers
  schemas.ts            zod schemas shared by the form and the action
  types.ts              DTO types: Serialized<Awaited<ReturnType<typeof getX>>>
  components/*.tsx      kebab-case file names, PascalCase named exports
```

Naming: files and folders in `kebab-case`, hooks `useX`, components `PascalCase`, no default exports
except Next.js pages/layouts.

## Writing an action

```ts
"use server";
export const deleteEvent = action(z.string(), async (eventId) => {
  const { membership } = await requireCoach();
  const event = await prisma.event.findFirst({ where: { id: eventId, teamId: membership.teamId } });
  if (!event) throw notFound("Événement introuvable");
  await prisma.event.delete({ where: { id: event.id } });
  return { message: "Événement supprimé" };
});
```

Always scope by the caller's section (`teamId: membership.teamId`) or club (`clubId: membership.clubId`):
never trust an id coming from the client.

## Writing a read

```ts
// app/api/events/[eventId]/route.ts
export const GET = route<{ eventId: string }>(async ({ params }) => {
  const { membership } = await requireMember();
  return getEvent(params.eventId, membership.teamId);
});
```

## Realtime

Socket.IO runs in the same process as Next (`server.ts`). The protocol (event names + payload types)
is shared in `lib/realtime/protocol.ts`. Server code emits through `server/realtime/emitter.ts`;
the client uses a single socket from `RealtimeProvider`.

## Background jobs

`server/jobs.ts` runs in the same process as the server (every 10 minutes): event reminders
(`features/events/server/reminders.ts`). Jobs must be idempotent (claim the row with a conditional
update before doing the work). `DISABLE_JOBS=1` turns them off on an instance.

## Branches

- `dev`: daily work. Every change goes to `dev` (directly or through a short-lived `feat/*` / `fix/*` branch
  opened as a PR against `dev`). CI runs on every push and PR.
- `main`: what is released. Only updated by a PR `dev` → `main` with a green CI; the release is automatic.
- Delete a feature branch once merged.

## Tests, CI and releases

- Unit tests sit next to the code (`*.test.ts`, `bun test`) and target pure functions
  (rules, recurrence, recipients). Keep business rules pure so they stay testable without a database.
- `.github/workflows/ci.yml`: typecheck, lint, tests, migrations on an empty PostgreSQL, build — on every PR.
- `.github/workflows/release.yml`: when `main` gets a `package.json` version without a release, it creates
  the tag `vX.Y.Z`, the GitHub Release (notes from `CHANGELOG.md`) and the image `ghcr.io/bouklifyacine/foothubgo:X.Y.Z`.
- Every PR updates the "Non publié" section of `CHANGELOG.md`.
