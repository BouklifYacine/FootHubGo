# Roadmap v1.1.0

Decisions taken with the product owner (2026-10-07). Every lot = one branch from `dev` + one PR into `dev`,
green CI required. Release: PR `dev` -> `main`, tag `v1.1.0`.

## Product decisions

- **Target**: adult amateur football (no youth sections, so no parent accounts). Mobile first, "ultra intuitive".
- **Sections**: a club has sections `SENIOR`, `VETERAN`, `LEISURE`. A user can belong to several sections
  (e.g. coach in one, player in another). Club roles `OWNER` / `ADMIN` (create sections, appoint coaches);
  section roles `COACH` / `PLAYER`. Invite code per section. Club-wide events visible to every section.
  Club chat channel + one channel per section. **Stripe subscription paid by the club.**
- **Playing time**: minutes played per player per match, entered by the coach on the match sheet; season totals in stats.
- **Man of the match**: voters = everyone present at the match (players who played + coach), vote open 48h after
  the match, one vote each, cannot vote for yourself.
- **Carpool**: away matches only for now. A driver offers seats (departure place + time); passengers book,
  first come first served; the driver can remove a passenger. Notifications to the driver / passengers.
- **PWA + Web Push**: installable app, push via VAPID (`web-push`), for call-ups, reminders, man of the match,
  carpool, chat. iOS: push only when the app is added to the home screen (iOS 16.4+).
- **Onboarding**: guided tour with driver.js (MIT), one tour per role, shown once, replayable from the menu.
- No Sentry for now. No finances, no weather.

## Lots

0. Audits (read only): UX audit + security audit -> `docs/audits/ux.md`, `docs/audits/security.md`.
1. Security fixes + launch blockers: audit findings, notification preferences + unsubscribe link,
   remove real club logos from the landing, French pricing section, tests on sensitive actions.
2. Clubs & sections (foundation, data migration). **Done** (branch `feat/clubs-and-sections`): `Club` /
   `ClubMember` (OWNER / ADMIN / MEMBER) above sections (`Team`, categories SENIOR / VETERAN / LEISURE), active
   section cookie + switcher, club management page, invite code and join requests per section, club-wide
   events, club chat channel, club subscription. One club per user for now. Audit L6 and L13 fixed.
3. UX refactor (mobile first) + onboarding tour.
4. Playing time + man of the match.
5. Carpool for away matches.
6. PWA + push notifications.
7. Release v1.1.0.
