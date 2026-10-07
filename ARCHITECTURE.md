# Architecture

FootHubGo is a Next.js 16 (App Router) app with a custom Node server (`server.ts`) that also hosts Socket.IO.
Data lives in PostgreSQL through Prisma 7. Client state is TanStack Query; forms use TanStack Form + zod.

**Code is in English** (files, identifiers, routes, comments). **UI text is in French** (users are French).

## Data flow — one rule

| Need | Server | Client |
|---|---|---|
| **Read** | `GET` route handler in `app/api/**/route.ts`, wrapped with `route()`, calling a function from `features/<f>/server/queries.ts` | `useQuery({ queryKey: queryKeys.x, queryFn: () => fetchJson(url) })` |
| **Write** | Server action in `features/<f>/actions.ts` (`"use server"`), built with `action(schema, handler)` | `useActionMutation(action, { invalidate: [queryKeys.x] })` |

Exceptions that stay REST: `app/api/auth/[...all]` (better-auth) and `app/api/webhooks/stripe` (external callers).

Why: server actions give CSRF protection, end-to-end types and no client fetch layer for writes,
but Next.js queues them one at a time, so reads go through cacheable, parallel `GET` routes.

## Shared building blocks (`lib/`)

| File | Purpose |
|---|---|
| `lib/auth/session.ts` | `requireUser()`, `requireAdmin()`, `requireMember(teamId?)`, `requireCoach(teamId?)`, `findMembership(userId)`. They **throw** — never compare against an `undefined` user id. |
| `lib/errors.ts` | `AppError(message, status)` + `unauthorized()`, `forbidden()`, `notFound()`. Messages are shown to the user. |
| `lib/api/route.ts` | `route(handler)` for GET handlers: awaits params, returns JSON, maps errors to `{ message }` + status. |
| `lib/actions/action.ts` | `action(zodSchema, handler)` → resolves to `ActionResult` `{ success, message, data? }`, never throws. |
| `lib/api/fetch-json.ts` | `fetchJson<T>(url)` / `withQuery(path, params)` for `queryFn`s. |
| `lib/query/keys.ts` | Every query key (hierarchical). Never write a raw key array in a hook. |
| `lib/query/use-action-mutation.ts` | Toasts + invalidation + optional optimistic update for server actions. |
| `lib/form` | `useAppForm` with `TextField`, `NumberField`, `TextareaField`, `SelectField`, `CheckboxField`, `DateField`, `SubmitButton`. |
| `lib/enum-labels.ts` | French labels for every Prisma enum + `toOptions()` for selects. |
| `lib/types.ts` | `Serialized<T>`: the JSON shape of a server value (Dates become strings). |

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

Always scope by the caller's team (`teamId: membership.teamId`): never trust an id coming from the client.

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
