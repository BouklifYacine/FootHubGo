# UX audit — FootHubGo (lot 0)

Date: 2026-10-07. Scope: the code on `dev` (read only) plus a mobile run-through of the real app (iPhone 13
viewport, 390×844, light and dark) with a throwaway database: sign-up, create a club, join with a code,
events, call-ups, chat, stats. Goal measured against: "ULTRA intuitive on mobile" for an amateur adult team.

Measured during the run (Playwright, `getComputedStyle`):

- `body` background is `rgba(0,0,0,0)` and `.text-muted-foreground` computes to the **same color as the body
  text** (light: `rgb(10,10,10)`, dark: white). Avatar fallbacks have no background (initials float).
- Squad table: 696 px wide inside a 358 px column. Club directory: 454 px in 292 px. Call-up table (coach): 8 columns,
  the player's name scrolls out of view as soon as you reach the "Action" column.
- On `/app/call-ups` the call-up card to answer is **below the fold**: four stacked counter cards fill the first screen.
- On `/app/events` the first card is a **past** match (default filter "Toutes les dates", ascending order).

## Status (lot 3, branch `feat/ux-mobile-and-onboarding`)

Implemented in lot 3, one commit per step. Decisions taken for the lot override the plan where they differ.

| Item | Status | Notes |
|---|---|---|
| 1. Navigation + page title | Done | Bottom tabs under `md` (Accueil, Agenda, Équipe, Messages, Plus; Accueil / Clubs / Plus without a club), badges (unread messages, call-ups to answer, join requests: `GET /api/me/badges`), top bar = back button + title + club/section switcher + bell, sidebar on `md+` from the same `lib/navigation.ts`, `/app/more`, settings in the shell (`/app/settings`). |
| 2. Home per role | Done | Next event (answer / call-up summary on it), À faire, coach checklist (dismissible, `User.onboardingSeen`), season blocks; no-club home with the two choice cards. Player-side checklist (avatar, position) not added: the player tour covers it. |
| 3. Call-up answer | Done | "Je suis dispo / Pas dispo" on the home, the agenda and the event page; the answer can be changed until 3h before (server rule changed); notifications deep-link. |
| 4. Coach event flow | Done | Agenda (list by default, calendar toggle), "Nouvel événement" in the header (`?new=1`), "Convoquer maintenant" after a match is created, event page as the hub, one scoreboard. No floating "+" button: the header button is visible on mobile. The calendar view keeps the month grid on mobile (the list view is already the default). |
| 5. Wide tables | Done | Squad, call-ups (grouped by answer), player stats, attendance, team injuries, club directory, join requests as cards under `md`. Admin users table unchanged (desktop-only screen). |
| 6. Theme tokens | Done | One HSL token set + status tokens (success / warning / info), sonner, theme toggle (`resolvedTheme`), `ThemeSelector`. |
| 7. First-run journey | Done | `/join/<code>` + share / copy, "J'ai un code" (landing + `/join`), `autoSignIn` (no email verification yet, security L2 deferred), land on `/app` after create / join. The display name stays unique (explained in the sign-up field). |
| 8. Destructive actions | Done | `useConfirm()` everywhere, no `window.confirm`. Decision: confirmation dialogs instead of "Annuler" toasts (cancel a call-up, refuse a request, close a poll). |
| 9. Touch | Done | 44px targets (button / input / select / menu items under `md`), bottom sheets (`ResponsiveDialog`), native date / time inputs on phones, visible message menu, `dvh` chat. Long-press on messages not added (visible "⋯" instead). |
| 10. Consistency | Done | `PageHeader`, `EmptyState`, `LoadingState`, `ErrorState`, `lib/format.ts`, tutoiement everywhere (emails included), per-page titles. The pricing section of the landing was already handled in lot 1. |
| Onboarding tour | Done | driver.js 1.8.0, coach / player tours (`features/onboarding/tours.ts`), once per user (DB), replay from Plus and the user menu. iPhone push hint not shown (lot 6 not done). |
| Accessibility basics | Done (partly) | Labels on placeholder-only inputs, focus rings on custom buttons, status = icon + text, `h1` on every page. Admin table checkboxes and the OTP field label not reviewed (admin / password reset screens unchanged). |

Deferred: the admin users table as cards (desktop tool), long-press on messages, a player first-run checklist,
"Annuler" toasts (replaced by confirmations), contrast measurements beyond the token values chosen.

---

## Top 10 problems (ranked by impact on "intuitive on mobile")

### 1. No real mobile navigation, and no page title
- **Where**: `components/app-shell/app-shell.tsx`, `components/app-shell/app-sidebar.tsx`, `components/ui/sidebar.tsx`.
- **What the user experiences**: on a phone the whole app lives behind a 28 px hamburger icon (`SidebarTrigger`, `size-7`)
  in the top left. It opens a sheet with 9 items. The top bar shows nothing else: no page title, no club name, no back
  button. You can't tell where you are, and every move between pages takes 2 taps plus a scan of 9 labels.
  `Événements` and `Calendrier` show the same data, and `Transfert` means "join requests".
  Settings (`app/settings/page.tsx`) leave the app shell completely (marketing `SiteHeader`), so there is no way back to the app except the avatar menu → "Mon club".
- **Fix**: a bottom tab bar under `md` (5 tabs, same for both roles: **Accueil · Agenda · Équipe · Messages · Plus**),
  with badges for unread messages, unanswered call-ups and pending join requests. The top bar shows the page title (and later
  the section switcher). Keep the sidebar for `md+`, built from the same nav config. Move settings inside the shell.

### 2. The home page shows no next step
- **Where**: `features/home/components/home-dashboard.tsx`, `features/home/server/queries.ts`, `team-card.tsx`,
  `recent-results.tsx`, `upcoming-matches.tsx`, `key-stats.tsx`, `leaderboard.tsx`.
- **What the user experiences**: coach and player see the same five tiles (club card with a 140 px initials avatar, last
  5 results, key stats, top scorers, next 3 **league/cup** matches; trainings are excluded). A brand new club fills the
  first two screens with a giant avatar and "Aucun match joué". The page answers neither "do I play Sunday?" (player)
  nor "who is coming Sunday?" (coach). Nothing on it can be tapped except "Effectif complet" and "Stats club →",
  and the player sees "Stats club →" even though the link opens their own stats. Without a club, the home is two outline buttons
  ("Créer un club", "Rejoindre un club") above a "Liste des clubs" table. Nothing explains the choice, and pending join requests
  are hidden under "Transfert".
- **Fix**: a home page per role (see plan, PR 6). At the top, a **Prochain rendez-vous** card (next event of any type) with the
  player's answer buttons right on it, or the coach's call-up summary "8 présents · 3 en attente · 2 absents" with a
  "Relancer / Convoquer" button. Below it, an **À faire** list (unanswered call-ups, join requests to review, match stats to
  enter, attendance to give). Then a first-run checklist. The stats tiles move below. Without a club: two large choice cards,
  "J'ai un code d'invitation" (primary) and "Créer mon club", then "Chercher un club" as a secondary link.

### 3. Answering a call-up, the most frequent player action, is buried
- **Where**: `features/call-ups/components/my-call-ups.tsx`, `my-call-up-card.tsx`, `app/app/call-ups/page.tsx`,
  `features/events/components/event-detail.tsx`, `features/notifications/components/notification-bell.tsx`.
- **What the user experiences**: the player receives a notification. In the bell popover, tapping it only marks it read:
  there is no link. They then have to open the hamburger, tap "Convocations" and scroll past four counter cards before
  they reach "Accepter / Refuser". The match page (`/app/events/[id]`) shows the player a team table
  (Joueur/Poste/Licencié/Blessé) but **not their own call-up or any answer button**. Once answered, the answer can't
  be changed (the card turns into a disabled "Présence confirmée" button), although the server allows answering until
  3 h before kick-off. The urgency rule ("moins de 24h") is the only time cue.
- **Fix**: answer buttons on the home card, on the event page and in the agenda list. "Changer ma réponse" stays possible
  until the deadline, and the card states it ("Tu peux changer d'avis jusqu'à samedi 12h"). Notifications deep-link to
  `/app/events/[id]` (store the URL in `Notification.data`). The counters move to a single line at the bottom of the page.
  Use one wording for both sides: **"Je suis dispo" / "Pas dispo"** for the player and "Présent / Absent / En attente" for the coach.

### 4. The coach's "create a match → call up players" flow is split across three screens
- **Where**: `features/events/components/event-list.tsx`, `event-card.tsx`, `event-detail.tsx`,
  `features/calendar/components/event-calendar.tsx`, `calendar-toolbar.tsx`, `event-dialog.tsx`, `event-details.tsx`,
  `features/call-ups/components/call-up-picker.tsx`, `call-up-table.tsx`.
- **What the user experiences**: an event can only be created from the calendar. On "Événements" the coach must find the
  "Planning" button, which opens the calendar, then a 32 px "+" whose label is hidden on mobile (`max-sm:sr-only`).
  The month view is cramped at 390 px (titles truncated, "Match J4 – US Voi…"). Call-ups go out either from
  the calendar dialog (details → "Convoquer" → picker) or from the event page table, one 36 px icon per row.
  "Modifier dans le calendrier" (event card menu) lands on the month view, not on the event. Event cards can't be
  tapped: details sit behind the "…" menu. The 24 h sending rule only appears once you are inside the picker. The match page shows
  the scoreboard twice (`EventHeader` + `TeamStatsPanel`'s `Scoreboard`).
- **Fix**: merge Événements + Calendrier into **Agenda** (list by default, "À venir" first, calendar as a toggle that
  defaults to `listMonth` on mobile). A floating "+" opens the event form in a bottom sheet. After a match is created,
  propose "Convoquer maintenant" right away (the picker with "Tout sélectionner" already exists). The event page becomes the hub:
  header, call-up summary, "Convoquer" button opening the picker, then lineup/stats. Show the 24 h rule in the form
  ("Les convocations partent jusqu'à 24h avant le match"). Make the whole card a link.

### 5. Wide tables on a phone
- **Where**: `features/team/components/squad-table.tsx` (8 columns, avatar in its own column),
  `features/call-ups/components/call-up-table.tsx` (8 columns for the coach), `features/stats/components/player-stats-table.tsx`
  (9 columns), `features/join-requests/components/team-directory.tsx` (5 columns, the action is a bare handshake icon),
  `features/injuries/components/team-injuries-table.tsx` (`w-[300px]` first column), `features/events/components/attendance-table.tsx`,
  `features/admin/components/users-table.tsx`.
- **What the user experiences**: horizontal scrolling with no visible scroll cue, names scrolling out of view, actions on the
  far right. "Licencié: Non" is red while "Blessé: Non" is green: the same word in two colors.
- **Fix**: under `md`, render each row as a **card/list item** (avatar + name + one status chip + one primary action,
  secondary actions in a bottom sheet). Keep `Table` for `md+`. Status = icon + text ("Blessé jusqu'au 12/10"),
  never color alone.

### 6. Broken theme tokens: weak hierarchy in light mode, rough dark mode
- **Where**: `app/globals.css`, `components/ui/sonner.tsx`, `components/theme-toggle.tsx`, `features/calendar/calendar.css`.
- **What the user experiences**: the second `:root`/`.dark` block redefines `--background`, `--foreground`, `--muted`,
  `--muted-foreground` as full `hsl(...)` values, while `@theme` wraps them again (`hsl(var(--background))`, which is invalid).
  The `@theme inline` block maps `--color-muted-foreground: var(----muted-foreground)` (four dashes, undefined). Result:
  `bg-background`, `bg-muted`, `text-muted-foreground`, `text-foreground`, `bg-brand` don't apply. Secondary text
  looks like primary text, avatar fallbacks are transparent, and the sonner `--normal-bg: var(--popover)` is a raw HSL triplet (invalid).
  Hard-coded colors that don't adapt (`border-gray-300` tiles, `bg-white`, `bg-orange-100`, `text-gray-500`, blue-500
  borders) give glaring borders in dark mode. The theme toggle reads `theme`, which is `"system"` by default: a dark-system
  user sees the Sun icon, and the first tap does nothing visible.
- **Fix**: one token set (keep the shadcn HSL triplets and delete the duplicated block and the `----` mappings), add
  `--sidebar-*`/`--brand` the same way, and replace hard-coded palette classes with tokens/variants. Use
  `resolvedTheme` in `ThemeToggle` (or a 3-way Clair/Sombre/Système menu).

### 7. The first-run journey has dead ends and extra steps
- **Where**: `features/auth/components/sign-up-form.tsx` + `auth.ts` (`autoSignIn: false`), `components/landing/hero.tsx`,
  `features/team/components/team-form-dialog.tsx`, `join-team-dialog.tsx`, `invite-code-dialog.tsx`, `team-header.tsx`.
- **What the user experiences**:
  - After sign-up you are sent to `/sign-in` and must type your email and password again.
  - The landing has a single CTA, "Créer mon club". A player who was given a code has no entry point that speaks to them.
  - The sign-up "Pseudo" must be unique in the whole database (`auth.ts` hook): common first names get refused.
  - After creating the club, the coach lands on `/app/squad`, a table with one row (themselves). There is no "invite your players"
    prompt, and the code sits behind a "⋮" menu → "Gérer le code d'invitation".
  - Inviting means dictating a 6-digit code: no link, no share sheet (WhatsApp is where these teams live).
  - After joining, the player also lands on the squad table.
- **Fix**: auto sign-in after sign-up, unless email verification is introduced (check with the security audit). Add a second CTA
  "J'ai un code" on the landing. Add a join link `/join/[code]` that carries the code through sign-up and joins automatically.
  Add a "Partager le lien" button (`navigator.share`, with copy as fallback) in the invite dialog and on the coach home checklist.
  Redirect to `/app` (home + checklist) after create/join. Make the display name non-unique, or explain the rule in the field.

### 8. Destructive actions: no confirmation, or the browser's `window.confirm`
- **Where**: `window.confirm` in `features/chat/components/conversation-view.tsx`, `group-settings-dialog.tsx`,
  `features/polls/components/poll-card.tsx`, `features/admin/components/admin-dashboard.tsx`. **No confirmation at all**:
  "Quitter le club" (`squad-table.tsx`, one tap on a red button), delete event (`event-card.tsx`, `event-details.tsx`),
  cancel a call-up (`call-up-table.tsx`), delete the invite code (`invite-code-dialog.tsx`), refuse a join request
  (`team-join-requests.tsx`), delete my join request (`my-join-requests.tsx`), remove avatar, "Supprimer pour tous" (message),
  "Clôturer" (poll).
- **What the user experiences**: on mobile, `window.confirm` is a native popup with the site URL as its title, and
  irreversible actions sit next to frequent ones without any guard. The five existing AlertDialogs each have their own styling
  (`bg-red-500` overrides vs `variant="destructive"`, "Êtes-vous sûr ?", "Êtes-vous absolument sûr ?").
- **Fix**: one `ConfirmDialog` + `useConfirm()` (async, returns a boolean) built on `components/ui/alert-dialog.tsx`, used everywhere.
  For reversible actions (cancel a call-up, refuse a request, close a poll), an "Annuler" toast action instead of a modal.

### 9. Touch-hostile interactions and small tap targets
- **Where**:
  - Message actions are `opacity-0 group-hover:opacity-100` (`message-list.tsx`): invisible on touch.
  - Information is hidden in tooltips: match score in `recent-results.tsx`, disabled reasons in `team-directory.tsx` and `call-up-table.tsx`.
  - Sub-menus inside dropdowns (`squad-table.tsx` "Modifier le rôle/poste").
  - A `Switch` to toggle scorers/assists (`leaderboard.tsx`).
  - Targets of 24–36 px: `Button` default `h-9`, `sm` `h-8`, icon `size-9`, review buttons `size-8`, message menu `size-6`,
    sidebar trigger `size-7`, password eye 16 px.
  - The chat frame is `h-[calc(100vh-120px)]` (`app/app/chat/page.tsx`), so the composer slides under the iOS toolbar/keyboard.
  - Dialogs with long forms are centered modals: event form with a date popover inside the dialog; injury form with a 5-row textarea.
- **What the user experiences**: actions they can't find, mis-taps, scrolling fights inside modals.
- **Fix**:
  - A `ResponsiveDialog`: `Dialog` on `md+`, `Sheet side="bottom"` under `md` (both components already exist).
  - Minimum 44 px targets on mobile (a `size="touch"` variant, or `max-md:h-11` on the shared variants).
  - Message actions on long-press, or a visible "⋯".
  - Inline text instead of tooltips; tabs (`ToggleGroup`) instead of the switch; `h-dvh` with safe-area padding for chat.
  - Native `<input type="date|time">` on mobile for the date fields.

### 10. Every page is built differently (titles, states, wording, dates)
- **Where**: across `features/*/components`.
- **What the user experiences**:
  - **Titles**: Squad, Events, Calendar, Stats and Chat have no title. Elsewhere: "Convocations de {name}" (`text-xl`),
    "Sondages" (`text-xl font-semibold`), "Gestion des blessures" (`text-3xl` gradient), "Candidatures reçues" (`text-2xl bold`),
    "Bienvenue {name}".
  - **Loading**: a `Loader2` spinner (home, squad, event), "Chargement..." text (events, polls, injuries, chat, directory), skeletons
    (call-ups, settings, admin), a custom border spinner (team injuries), a full-screen `StatsSkeleton`.
  - **Empty states**: 7 styles, among them `<p>Aucun événement correspondant</p>`, `<p>Pas de joueurs dans l'effectif</p>` and
    a `text-4xl` "Aucune équipe trouvée pour ce club". None offers an action ("Créer un événement", "Inviter des joueurs").
  - **Errors**: raw `error.message` in `text-red-500` or `text-destructive`, with no retry.
  - **Dates**: about 12 formats (`dd/MM/yyyy HH'h'mm`, `dd/MM/yyyy 'à' HH:mm`, `HH:mm` vs `HH'h'mm`, `toLocaleDateString`,
    `PPP`, `EEEE d MMMM`…).
  - **Wording**: a **tu/vous mix**. The UI says "vous"; call-up notifications and reminders say "tu"
    (`features/call-ups/actions.ts` "Tu es convoqué…", `features/events/reminder-recipients.ts` "Pense à indiquer ta présence").
    The answer is labelled "Accepter/Refuser", "Confirmé/Refusé" or "Présence confirmée/Absence confirmée"
    depending on the screen, and the same pages are called "Planning", "Calendrier" or "Événements".
  - **English leftovers**: the whole pricing section ("Pricing", "Monthly/Yearly", "Billed … annually", "Purchase",
    shadcnblocks.com links; covered by lot 1), sr-only "Close" in `components/ui/dialog.tsx`/`sheet.tsx`, "Sidebar / Displays
    the mobile sidebar." in `components/ui/sidebar.tsx`, "Github" (→ GitHub).
  - **Misleading copy**: "Connexion avec Google" buttons on the *sign-up* page; the sign-in subtitle mentions only
    social login; Terms links are `href="#"`; "demande(s)"; "Modifier stats".
  - **Page title**: the browser tab title is "FootHubGo" on every page.
- **Fix**: shared `PageHeader`, `EmptyState`, `LoadingState`, `ErrorState`; `lib/format.ts` (dates); a short glossary +
  wording pass; per-page `metadata.title` (see plan).

---

## Journeys, step by step (as built today)

| Journey | Steps / taps on mobile | Breaks |
|---|---|---|
| Landing → sign up (coach) | "Créer mon club" → form (3 fields) → **redirect to sign-in, retype email + password** → `/app` | Re-login; CTA only for coaches; unique pseudo |
| Create the club | "Créer un club" → dialog (name, level select, visibility select, description) → "Créer" → `/app/squad` | Lands on a one-row table; nothing says "invite your players" |
| Invite players | Home tile shows the code, or Effectif → "⋮" → "Gérer le code" → copy | Code only, no link/share; nothing tracks who joined |
| Join (player) | Landing (coach CTA) → sign-up → sign-in again → "Rejoindre un club" → 6 digits → `/app/squad` | No "I have a code" entry; lands on a table |
| Apply to a public club | No-club home → table → handshake icon (tooltip only) → dialog (poste, niveau, motivation) | Pending requests are under "Transfert", not on the home |
| First event (coach) | ☰ → Événements → "Planning" → "+" (icon only) → dialog: title, type, date popover + time, place, description, opponent → Enregistrer | ~5 taps before the form; form in a modal |
| Call-ups (coach) | Calendar: tap event → "Convoquer" → "Tout sélectionner" → "Convoquer (n)" (4 taps). Or event page → one icon per row | 24 h rule only shown inside the picker; no summary of answers anywhere except the 8-column table |
| Answer a call-up (player) | Bell (no link) → ☰ → Convocations → scroll past 4 cards → Accepter | Not on the home or the event page; answer can't be changed |
| Training attendance (player) | ☰ → Événements → select on the card | Not on the event page, not on the home |
| Chat | ☰ → Messages → team channel → write | Message menu invisible on touch; `100vh` layout |
| Match stats (coach) | Event page → "Ajouter stats" (3 h after kick-off) → team form; tab "Statistiques" → "+" per player, choosing the player in a select, one dialog per player | Nothing reminds the coach; 15 dialogs for a squad |
| Player stats | ☰ → Statistiques | Fine, but "Participez à un match pour voir vos statistiques" is a centered `<p>` in a `min-h-screen` box |

## Information architecture today

| Role | Sidebar items (`app-sidebar.tsx`) | Home (`home-dashboard.tsx`) |
|---|---|---|
| No club | Accueil, Transfert | 2 buttons + club table |
| Player | Accueil, Effectif, Événements, Statistiques, Convocations, Blessures, Calendrier, Sondages, Messages (9) | Club card, last 5 (with rating), own key stats, leaderboard, next 3 league/cup matches |
| Coach | Accueil, Transfert, Effectif, Événements, Statistiques, Blessures, Calendrier, Sondages, Messages (9) | Same tiles, team stats instead of own stats, invite code on the card |

Proposed (works with sections later; the section switcher sits in the top bar and in "Plus"):

| Tab | Player | Coach |
|---|---|---|
| **Accueil** | Next event + my answer, À faire, my stats summary | Next event + call-up summary, À faire (answers, requests, stats to enter), checklist |
| **Agenda** | Upcoming/past list, calendar toggle, answer or attendance inline | Same + "+" button, "Convoquer", edit |
| **Équipe** | Effectif (cards), Blessures (mine) | Effectif, Blessures, Demandes d'adhésion (badge), invite |
| **Messages** | Club/section channels, DMs, groups | Same |
| **Plus** | Statistiques, Sondages, Paramètres, Revoir le guide, (Changer de section) | Same + club settings |

Later features fit without new top-level items: playing time and man of the match → event page + Stats; carpool →
event page (away matches); push opt-in → À faire + Paramètres.

## Accessibility basics

- **Contrast / tokens**: see problem 6. After the fix, check `text-zinc-400`/`text-gray-500` on dark backgrounds
  (≈4:1 or less) and the light `bg-*-100` badges in dark mode.
- **Labels**:
  - `DateField` (`lib/form/fields.tsx`) renders `<FieldLabel htmlFor={field.name}>`, but the `DatePicker`/`DateTimePicker` button has no `id`.
  - Placeholder-only inputs: chat search, "Nom du groupe...", "Rechercher un membre...", admin "Pseudo".
  - Unlabelled checkboxes in the admin table.
  - The OTP input has no visible label inside the dialog.
- **Status by color only**: Licencié/Blessé "Oui/Non" badges; poll "mine" border; the online dot (`aria-label` on a bare `span`).
- **Focus**: custom `<button>`s (conversation list, poll options, group members, new-conversation members) have no `focus-visible`
  style. The password toggle has `tabIndex={-1}`.
- **Headings / titles**: missing `h1` on several pages; one global `<title>`.
- **Touch**: see problem 9.

---

## UX refactor plan (lot 3, small PRs, no new dependency except driver.js)

Order matters: PR 1–2 are foundations, PR 3 changes navigation, PR 4–6 rework the key flows, PR 7–10 polish, PR 11 is the tour.

**PR 1 — Theme tokens + formatting foundations**
- `app/globals.css`: one HSL token set; delete the duplicated `:root/.dark` block and the `@theme inline` `----*` mappings; define `--sidebar-*`, `--brand` consistently.
- `components/ui/sonner.tsx`: `hsl(var(--popover))`…
- `components/theme-toggle.tsx`: `resolvedTheme`.
- `features/calendar/calendar.css`: check after the token change.
- New `lib/format.ts`: `formatDate` ("sam. 12 oct."), `formatDateTime` ("sam. 12 oct. à 15h00"), `formatTime` ("15h00"), `formatRelative`. Replace the ~12 local formats.

**PR 2 — Shared UI building blocks** (`components/app/`)
- `page-header.tsx`: title, optional description, one primary action; renders the top-bar title on mobile.
- `empty-state.tsx`: move from `features/home/components/empty-state.tsx`; icon + title + text + optional action button; tokens only.
- `loading-state.tsx`: `Skeleton`-based variants (`list`, `cards`, `detail`); delete text loaders and custom spinners.
- `error-state.tsx`: message + "Réessayer" (`refetch`).
- `confirm-dialog.tsx` + `use-confirm.ts`: replace the 4 `window.confirm` and the 5 ad-hoc AlertDialogs, and add confirms on: leave club, delete event, delete invite code, delete my request, "Supprimer pour tous". Undo toasts for: cancel a call-up, refuse a request, close a poll.
- `responsive-dialog.tsx`: `Dialog` (md+) / `Sheet side="bottom"` (mobile) via `hooks/use-mobile`. Migrate `event-dialog.tsx`, `team-form-dialog.tsx`, `injury-form-dialog.tsx`, `join-request-dialog.tsx`, `create-poll-dialog.tsx`, `player-stats-form.tsx`, `team-stats-form.tsx`, `new-conversation-dialog.tsx`, `group-settings-dialog.tsx`.

**PR 3 — Mobile shell: bottom navigation + top bar**
- New `lib/navigation.ts` (single nav config per role, badges); new `components/app-shell/bottom-nav.tsx`.
- `app-shell.tsx`: top bar = back button on detail pages + page title + bell; `pb-[calc(4rem+env(safe-area-inset-bottom))]`; `h-dvh`.
- `app-sidebar.tsx`: md+ only, same config; remove "Transfert"/"Calendrier"/"Convocations" as top-level items.
- Move settings into the shell (`app/app/settings/page.tsx`, with a redirect from `/settings`); `app/settings/page.tsx`, `nav-user.tsx`.
- Badge data: `useUnreadMessagesCount`, plus a small `me/badges` read (pending call-ups, pending join requests) in `features/home`.

**PR 4 — Agenda + event page as the hub**
- `features/events/components/event-list.tsx`: "À venir" by default, grouped by week, whole card tappable, "+" floating button for the coach (opens `EventForm` in `ResponsiveDialog`), list/calendar toggle.
- `event-card.tsx`: inline answer (player) / call-up summary (coach).
- `event-calendar.tsx`: `initialView` `listMonth` on mobile.
- `app/app/calendar/page.tsx` → redirect to `/app/events?view=calendar`.
- `event-detail.tsx`: the player's answer block (reuse the `MyCallUpCard` logic, "Changer ma réponse"), training attendance select, coach summary + "Convoquer" (reuse `CallUpPicker`); remove the duplicated scoreboard (`team-stats-panel.tsx` vs `event-header.tsx`).
- `event-form.tsx`: after creating a match, offer "Convoquer maintenant"; hint about the 24 h rule.
- `my-call-up-card.tsx`: allow changing the answer until the deadline.
- `my-call-ups.tsx`: counters as one compact line under the list.

**PR 5 — Lists instead of tables under `md`**
`squad-table.tsx` (member card + action sheet instead of dropdown sub-menus), `call-up-table.tsx` (grouped by status:
Présents / En attente / Absents / Non convoqués), `player-stats-table.tsx`, `team-directory.tsx` (card with a "Postuler" text
button and the reason shown inline), `team-injuries-table.tsx`, `attendance-table.tsx`; admin `users-table.tsx` last.
Status chips = icon + text.

**PR 6 — Home per role + first-run checklist**
- `features/home/server/queries.ts`: add `nextEvent` (any type) with `myCallUp`/`myAttendance`, `callUpSummary` (coach), `todo` (unanswered call-ups, pending join requests, past matches without stats, trainings without attendance), `checklist` flags derived from data. No new table: coach = `memberCount > 1`, `eventCount > 0`, `callUpCount > 0`, `teamMessageCount > 0`; player = has avatar, has position, has answered a call-up.
- New components: `next-event-card.tsx`, `todo-list.tsx`, `first-run-checklist.tsx` (hidden once complete, dismissible).
- `home-dashboard.tsx`: order next event → À faire → checklist → stats tiles (the 140 px club avatar goes into a compact header).
- `NoTeam`: two choice cards ("J'ai un code d'invitation" primary, "Créer mon club"), pending requests (`MyJoinRequests` compact), "Chercher un club" link.

**PR 7 — Onboarding flow fixes**
- `auth.ts`: `autoSignIn: true` (confirm with the security audit) and drop the redirect to `/sign-in` in `sign-up-form.tsx`.
- `components/landing/hero.tsx`: second CTA "J'ai un code".
- New `app/join/[code]/page.tsx`: signed out → sign-up with `?next=`; signed in → join.
- `invite-code-dialog.tsx`: "Partager le lien" (`navigator.share`, copy fallback).
- `team-form-dialog.tsx` / `join-team-dialog.tsx`: redirect to `/app`.
- Sign-up copy: "S'inscrire avec Google"; explain the display-name rule or drop the uniqueness.

**PR 8 — Notification deep links**
`features/notifications/server/notify-user.ts`: store `data.url`; callers in `features/call-ups/actions.ts`,
`features/events/server/reminders.ts`, `features/join-requests/actions.ts`, `features/polls/actions.ts`.
`notification-bell.tsx`: rows become links, mark read, close the popover; on mobile, a full-height `Sheet`.
Push in lot 6 reuses the same URL.

**PR 9 — Wording pass + titles**
- Decide "tu" (recommended: amateur sport clubs talk that way, and the notifications already use it) or "vous", then apply it everywhere, `emails/` included.
- Glossary: Agenda, Événement, Match, Entraînement, Convocation, "Je suis dispo / Pas dispo", Présent/Absent/En attente, Effectif, Demande d'adhésion (not "Transfert"), Section.
- Fix English leftovers (`components/ui/dialog.tsx`, `sheet.tsx`, `sidebar.tsx` sr-only texts, "GitHub").
- Per-page `export const metadata = { title }` with a `title.template` "%s · FootHubGo" in `app/layout.tsx`.

**PR 10 — Touch and a11y pass**
- Tap targets: `components/ui/button.tsx` sizes `max-md:h-11`/`size-11`; sidebar trigger.
- `message-list.tsx`: visible "⋯" or long-press.
- Tooltips → inline text: `recent-results.tsx`, `team-directory.tsx`, `call-up-table.tsx`.
- `leaderboard.tsx`: `ToggleGroup`.
- `lib/form/fields.tsx`: `id` on the date trigger; native date/time inputs on mobile.
- `aria-label`s on placeholder-only inputs; `focus-visible` on custom buttons.
- `app/app/chat/page.tsx`: `h-dvh` + safe area.

**PR 11 — Onboarding tour (driver.js)** — see below.

---

## Onboarding tour (driver.js)

**Mechanics**
- Add `driver.js` (MIT, pinned version).
- New `features/onboarding/tours.ts` (step definitions per role) and `features/onboarding/components/tour-launcher.tsx`. The launcher mounts in `app-shell.tsx` on `/app` once the home data is loaded.
- Run once per user and role. Store it in the DB (e.g. a `User.toursSeen String[]` column via a small action), not in `localStorage`, so "shown once" holds across devices. Keys: `coach-v1`, `player-v1`.
- "Revoir le guide" sits in **Plus** and in the user menu.
- Drop any step whose element is missing (`document.querySelector`) so the tour never points at nothing. Mobile: `side: "top"` for bottom-nav steps.
- French controls: `nextBtnText: "Suivant"`, `prevBtnText: "Retour"`, `doneBtnText: "C'est parti !"`, `progressText: "{{current}} / {{total}}"`, `showProgress: true`, `allowClose: true`.
- Once sections exist, the first step points at the section switcher only if the user has more than one section.
- Text below uses "tu" (to match PR 9; switch to "vous" if the owner decides so).

**Coach tour** (`coach-v1`, starts on the home)

| # | Element (`data-tour`) | Title | Text |
|---|---|---|---|
| 1 | `home-next-event` (next-event card, or checklist when there is no event) | Ton tableau de bord | Ici, le prochain match ou entraînement et qui a répondu. Tout ce qui demande ton attention s'affiche juste en dessous. |
| 2 | `invite-players` (checklist / invite button) | Invite ton équipe | Partage le lien d'invitation sur le groupe WhatsApp : tes joueurs rejoignent le club en un clic. |
| 3 | `nav-agenda` (bottom nav / sidebar item) | Matchs et entraînements | Crée tes matchs et tes entraînements (même répétés chaque semaine) depuis l'Agenda. |
| 4 | `home-callup-summary` (summary + "Convoquer" on the next-event card) | Convoque en deux gestes | Choisis tes joueurs, ils sont prévenus tout de suite et répondent depuis leur téléphone. |
| 5 | `nav-messages` | Le vestiaire | Le salon de l'équipe et les messages privés, pour tout dire au même endroit. |
| 6 | `nav-more` | Et le reste | Stats, sondages, blessures et réglages sont dans « Plus ». Tu peux revoir ce guide à tout moment. |

**Player tour** (`player-v1`, starts on the home)

| # | Element (`data-tour`) | Title | Text |
|---|---|---|---|
| 1 | `home-next-event` | Ton prochain rendez-vous | Le prochain match ou entraînement de ton équipe, avec l'heure et le lieu. |
| 2 | `callup-answer` (answer buttons on the next-event card; dropped if no call-up) | Dispo ou pas ? | Quand le coach te convoque, réponds ici en un geste. Tu peux changer d'avis jusqu'à 3h avant le match. |
| 3 | `nav-agenda` | Tout le calendrier | Tous les matchs et entraînements. Indique ta présence aux entraînements depuis l'Agenda. |
| 4 | `notification-bell` | Ne rate rien | Convocations, rappels et sondages arrivent ici. |
| 5 | `nav-messages` | Le vestiaire | Discute avec toute l'équipe ou en privé avec un coéquipier. |
| 6 | `nav-more` | Ton profil et tes stats | Tes stats, tes blessures et ton profil (photo, poste) sont dans « Plus ». Tu peux revoir ce guide à tout moment. |

**`data-tour` attributes to add**

| Attribute | Component |
|---|---|
| `home-next-event` | new `features/home/components/next-event-card.tsx` (root) |
| `home-callup-summary` | coach summary block inside `next-event-card.tsx` |
| `callup-answer` | answer button group (shared by `next-event-card.tsx`, `my-call-up-card.tsx`, event page) |
| `invite-players` | invite button in `first-run-checklist.tsx` (fallback: "Inviter" action in the Équipe page header) |
| `nav-agenda`, `nav-team`, `nav-messages`, `nav-more`, `nav-home` | `components/app-shell/bottom-nav.tsx` items, and the same values on `app-sidebar.tsx` items (`md+`); render the attribute only on the visible one |
| `notification-bell` | `features/notifications/components/notification-bell.tsx` trigger |
| `section-switcher` | future top-bar section switcher (lot 2/3) |
| `tour-replay` | "Revoir le guide" entry in Plus / `nav-user.tsx` |
