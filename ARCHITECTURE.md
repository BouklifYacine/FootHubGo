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
| `lib/format.ts` | The only date formatting of the UI (French, `Intl`): `formatDate`, `formatDateTime`, `formatTime` ("15h00"), `formatDayLabel`, `formatRelative`... Server code passes `TEAM_TIME_ZONE`. |
| `lib/navigation.ts` | The navigation config (bottom tabs, sidebar, Plus page, top bar titles and back targets), per role. |
| `lib/security-headers.ts` | CSP and other security headers set in `next.config.ts`. |

## UI building blocks and navigation

**Shell** (`components/app-shell`): under `md`, a top bar (back button on detail pages and the pages opened
from Plus, page title + "Club · Section" switcher, bell) and the bottom tab bar (`bottom-nav.tsx`: Accueil,
Agenda, Équipe, Messages, Plus; badges from `useNavigation()`: unread messages + `GET /api/me/badges`). On `md+`
the sidebar, built from the same `lib/navigation.ts`. Page content gets the bottom padding of the tab bar and
the safe areas; full-height pages (chat) are listed in `FULL_HEIGHT_PAGES` and sized in `dvh`. Add a page:
an entry in `PRIMARY_NAV` (tab) or `MORE_NAV` (Plus + sidebar) with its `visible(context)` rule.

**Shared blocks** (`components/app`), use them instead of ad-hoc markup:

| Component | Use |
|---|---|
| `Page`, `PageHeader`, `SectionTitle` | Page layout and title (`h1`; under `md` the visible title is the top bar's, the description and actions stay). One primary action in `actions`. |
| `EmptyState` | Icon + title + text + the next step (`action: { label, href \| onClick }`). |
| `LoadingState` | Skeletons (`list`, `cards`, `detail`): no spinners, no "Chargement...". |
| `ErrorState` | The API message + "Réessayer" (`onRetry={refetch}`). |
| `useConfirm()` (`ConfirmProvider` in the root layout) | `if (await confirm({ title, description, confirmLabel })) mutate()`: every destructive action, never `window.confirm`. |
| `ResponsiveDialog*` | Same API as `Dialog`; a bottom sheet under `md`. Every form dialog uses it. |
| `SegmentedControl` | 2 to 4 exclusive views (Liste / Calendrier, Buteurs / Passeurs). |

**Design rules**: colors only from the tokens of `app/globals.css` (HSL triplets; `success` / `warning` / `info`
for statuses, always icon + text: `Badge` variants `success`, `warning`, `danger`, `info`, `muted`), so dark mode
follows. Tap targets are 44px under `md` (the `Button` / `Input` / `Select` sizes already are). Tables are for
`md+` only: under `md`, render a card list. Copy is French with "tu"; glossary: Agenda, Événement, Match,
Entraînement, Convocation, "Je suis dispo / Pas dispo" (player), Présent / Absent / En attente (coach), Effectif,
Demande d'adhésion, Section.

**Participation** (`features/events/server/participation.ts`): "who is coming" for a set of events from the
caller's point of view (my call-up and whether I can still answer, my training answer, the coach's answers
summary). The home, the agenda list and the event page all read it, and share `CallUpAnswer`,
`AttendanceAnswer` and `CallUpSummary` (+ `participationInvalidation` after a write).

**Onboarding** (`features/onboarding`): `tours.ts` holds the coach and player tours (driver.js, 6 steps max)
anchored on `data-tour` attributes; `buildTour()` drops the steps whose element is missing. `TourLauncher`
(mounted by the shell) starts the tour on the home the first time, or on `/app?tour=1` (replay from Plus / the
user menu). Seen tours and the dismissed coach checklist are stored per user in `User.onboardingSeen`
(`markOnboardingSeen`), so they follow the user across devices. Bump a key (`coach-v2`) to show a reworked
tour again.

**Match day** (lot 4-5). Only **section matches** (`type` LEAGUE / CUP, `teamId` set): trainings and club-wide
events never get playing time, a man of the match or a carpool. Every rule is pure and tested next to the code.

- **Playing time** (`features/stats/playing-time.ts`): the coach's sheet ("Temps de jeu" tab of the match page,
  `savePlayingTime`) lists the **present players** (PLAYERs of the section with a CONFIRMED call-up), one tap
  Titulaire (90') / Entré (30') / Pas joué + minute presets, 0..130 minutes (extra time), 11 starters max. It
  opens with the stats window (kick-off + 3h, score entered first, editable until +48h). 0 minutes = no
  `PlayerStat` row (refused for a scorer); rows created by the sheet have no rating / position yet (nullable
  columns, left out of the average rating). Season totals: `summarizePlayerStats` (minutes, minutes per match
  played) and `getTeamPlayingTime` (`GET /api/stats/teams/<id>/players`, the coach's ranking).
- **Man of the match** (`features/motm`): the vote opens at kick-off + 3h (same as the stats) and lasts 48h
  (`motmWindow`, derived from `startDate`, no extra table). Nominees = present players; voters = present players
  + the section's coaches; at least 2 present players. One `MotmVote` per voter and match (unique), changeable
  until the end, never for yourself. **Results are hidden for everyone until the end** (only the turnout shows,
  so nobody votes for the leader); ties = co-winners, no vote = no winner; winners are computed from the votes
  (`motmWinners`, `motmAwardsByUser`), never stored. Jobs (`features/motm/server/jobs.ts`, run by `server/jobs.ts`)
  notify the voters when the vote opens and the winners when it closes, each match claimed once with
  `Event.motmOpenNotifiedAt` / `motmClosedAt`. Read: `GET /api/events/<id>/motm`; write: `voteManOfTheMatch`
  (rate limited). Awards show in the player's stats and the team ranking.
- **Carpool** (`features/carpool`): `Event.isHome` (Domicile / Extérieur in the event form, synced by the score
  form; existing events took the home/away of their score, the others are home). Only an **away** section match,
  only the members of its section (players and coaches). `Ride` (one per driver and match: seats 1..8,
  departure place, time between 24h before and kick-off, note) and `RidePassenger` (one seat per user and match,
  `eventId` denormalized for the unique index). Booking (`server/booking.ts`) locks the user on the match
  (`pg_advisory_xact_lock`: nobody is both driver and passenger) then the ride row (`FOR UPDATE`): first come
  first served, no overbooking. Everything closes at kick-off; a match with rides can't be switched back to home.
  Notifications: booking / seat given back -> driver; passenger removed / ride cancelled -> passengers.
- **Where it shows**: the event page (carpool block for away matches, man-of-the-match block after the score,
  third tab "Temps de jeu"), the home "À faire" (`motmVotes`: votes waiting for the user; `carpools`: confirmed
  players without a car or a seat in the next 7 days), `participationOf` (`motmVote`, `carpool`: agenda badges).
  Notifications use `notifyUser({ url: "/app/events/<id>" })`, types `MAN_OF_THE_MATCH` and `CARPOOL`.

**Invites**: `/join/<code>` shows the club and section of an invite code (rate limited per IP); signed-out
visitors sign up / in with `?next=` (`safeNextPath`, no open redirect) and come back to join in one tap.

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
  the section **or** a club OWNER / ADMIN (`requireSectionManager`, which also checks that a section id from
  the client belongs to the caller's club: `canManageSection` alone trusts any id for an OWNER / ADMIN), except the existing coach-only screens
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
  Checkout metadata; webhook resolves the club by `stripeCustomerId`, created once per club before its first
  checkout). `past_due` keeps Pro while Stripe retries the payment; every `customer.subscription.updated` syncs
  the end date (renewals, cancellation scheduled or undone). A webhook event is claimed (`StripeEvent`) then marked
  `handledAt`: a claim left unfinished for 5 minutes is taken over by Stripe's next retry. Legacy per-user subscriptions of users who
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

## PWA and Web Push (lot 6)

- **Installable app**: `app/manifest.ts` (`/manifest.webmanifest`, start `/app`, standalone, icons in
  `public/icons/`: regular + maskable 192/512, `apple-touch-icon`, monochrome `badge-96`; sources `icon.svg`,
  `icon-maskable.svg`, `badge.svg`, PNGs rendered once with sharp). iOS meta (`appleWebApp`) in the root layout.
- **Service worker** `public/sw.js` (hand-written, no build step; bump `VERSION` to drop old caches), registered
  by `PwaSetup` in the **app shell only** (scope `/`, `updateViaCache: "none"`; `/sw.js` is served `no-cache`, see
  `serviceWorkerHeaders`). Navigations: network, offline -> `public/offline.html` ("Tu es hors ligne",
  self-contained). Cache-first only for `/_next/static/*` (hashed) and `/icons/*` (150 entries max). API, auth,
  server actions, RSC payloads and Socket.IO are never touched; the HTML of the app is never cached. `push` shows
  the notification (tag = replaces the previous one); `notificationclick` focuses a tab on the URL, navigates an
  open tab, or opens one (only `/app` paths).
- **Sending** (`features/push`): `notifyUser` / `notifyUsers` are the ONLY entry point for notifications: they
  store, emit to sockets, then call `sendPush(userIds, category, payload)` (not awaited, never throws). Which type
  pushes and under which preference is the table in `categories.ts` (`pushCategoryOf`): CALL_UP + EVENT_REMINDER
  -> `callUps`, MAN_OF_THE_MATCH -> `motm`, CARPOOL -> `carpool`, JOIN_REQUEST / JOINED_TEAM / NEW_POLL -> `club`;
  LEFT_TEAM, INJURY_REPORTED, FINANCE_DUE never push (vote changes create no notification, so never push).
  `payload.ts` builds `{ title, body, url, tag }` from what the notification already shows. `sendPush` skips users
  who muted the category (`User.pushMutedCategories`), deletes subscriptions answered 404 / 410, updates
  `lastUsedAt`, logs counts and status codes only. TTL 12h (24h club, 1h chat), urgency high for call-ups / chat.
- **Chat** (`server/chat-push.ts`, called by `sendMessage`): only participants with **no connected socket**
  (`isUserConnected`), never someone who blocked the sender; one push per recipient and conversation every 3
  minutes (`chat-throttle.ts`, in memory), the next one says "N nouveaux messages", tag `chat:<conversation>`;
  it opens `/app/chat?c=<id>`.
- **Subscriptions**: `PushSubscription` (endpoint unique, p256dh, auth, device label "Chrome · Android",
  `createdAt`, `lastUsedAt`), cascade on user deletion. The endpoint must be a browser push service
  (`isPushServiceEndpoint`: FCM, Mozilla, Apple, WNS; no SSRF), checked on subscribe and again before sending.
  Every subscription of the user is deleted when they are signed out everywhere (password change / reset, email
  change, lockout). `subscribePush` (upsert on the endpoint, 10 devices max:
  the least recently used goes, 20 per hour), `unsubscribePush` (settings switch off, sign-out),
  `setPushCategory`. `GET /api/push/config` gives the VAPID public key at runtime (`null` = push disabled), so
  the Docker image needs no key at build time. Keys: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
  (`bunx web-push generate-vapid-keys`).
- **Client** (`client/pwa.ts`, `hooks/use-push.ts`): state per device from `support.ts` (pure): `enabled`,
  `disabled`, `denied` (explains how to re-allow), `unsupported`, `unconfigured`, `ios-needs-install` (iPhone /
  iPad in a browser tab: Web Push needs the home screen app, iOS 16.4+). Permission is only asked on a tap: the
  home card `PushOptInCard` ("Active les notifications...", "Plus tard" hides it 30 days on this device) and the
  settings switch (`/app/settings?section=notifications`, + the 5 categories). `PwaSetup` re-syncs the device's
  subscription once per visit (expired subscription or new server key). `InstallAppCard` (Plus, settings):
  `beforeinstallprompt` on Chromium, Share -> "Sur l'écran d'accueil" steps on iOS, browser menu elsewhere.
- **Onboarding**: iPhone Safari players (not installed) get tour `player-v2`, where the bell step becomes the
  "Ajoute l'app à ton écran d'accueil" hint (still 6 steps max); `player-v2` counts as seen for `player-v1`.

## Background jobs

`server/jobs.ts` runs in the same process as the server (every 10 minutes): event reminders
(`features/events/server/reminders.ts`) and the man-of-the-match votes (`features/motm/server/jobs.ts`). Jobs must be idempotent (claim the row with a conditional
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
- Local data: `bun run db:seed` (`scripts/seed.ts`) wipes and recreates demo accounts `*@foothub.test`
  (password `motdepasse123`). Never in production (it refuses `NODE_ENV=production`).
- `.github/workflows/release.yml`: when `main` gets a `package.json` version without a release, it creates
  the tag `vX.Y.Z`, the GitHub Release (notes from `CHANGELOG.md`) and the image `ghcr.io/bouklifyacine/foothubgo:X.Y.Z`.
- Every PR updates the "Non publié" section of `CHANGELOG.md`.
