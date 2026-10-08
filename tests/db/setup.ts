/**
 * Preloaded by `bun run test:db` (scripts/test-db.ts) before every database test file.
 *
 * - The REAL server code runs (guards, actions, Prisma, PostgreSQL). Only the edges are replaced:
 *   the session (who is signed in), Next.js request cookies / headers and outgoing emails.
 * - Every test starts from an empty database (all tables truncated, migrations kept).
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { beforeEach, mock } from "bun:test";

if (!/_test(\?|$)/.test(process.env.DATABASE_URL ?? "")) {
  throw new Error("Database tests run on a *_test database only: use `bun run test:db`");
}

export type TestUser = { id: string; name: string; email: string; image: string | null };

/** Per-request identity (concurrent calls in one test can be made as different users). */
type RequestContext = { user: TestUser | null; cookies: Map<string, string> };

type Shared = {
  storage: AsyncLocalStorage<RequestContext>;
  context: RequestContext;
  emails: { to: string; subject: string }[];
};

// On globalThis: the same state whether this file is reached as the preload or as an import.
const shared: Shared = ((globalThis as { __dbTest?: Shared }).__dbTest ??= {
  storage: new AsyncLocalStorage<RequestContext>(),
  context: { user: null, cookies: new Map() },
  emails: [],
});
const { storage } = shared;

const current = () => storage.getStore() ?? shared.context;

/** Runs `run` as `user` (with its own cookies): for concurrent calls made by different users. */
export function asUser<T>(user: TestUser | null, run: () => Promise<T>, activeSection?: string) {
  const cookies = new Map<string, string>();
  if (activeSection) cookies.set("fhg-section", activeSection);
  return storage.run({ user, cookies }, run);
}

/** Signs `user` in for the following calls of the test (null: signed out). */
export function signInAs(user: TestUser | null, activeSection?: string) {
  shared.context = { user, cookies: new Map(activeSection ? [["fhg-section", activeSection]] : []) };
}

export const sentEmails = () => shared.emails;

mock.module("@/auth", () => ({
  auth: {
    api: {
      getSession: async () => {
        const { user } = current();
        return user ? { user, session: { id: `session-${user.id}`, userId: user.id } } : null;
      },
    },
  },
}));

mock.module("next/headers", () => ({
  headers: async () => new Headers({ "user-agent": "db-tests", "x-foothubgo-client-ip": "127.0.0.1" }),
  cookies: async () => {
    const { cookies } = current();
    return {
      get: (name: string) => (cookies.has(name) ? { name, value: cookies.get(name)! } : undefined),
      set: (name: string, value: string) => void cookies.set(name, value),
      delete: (name: string) => void cookies.delete(name),
    };
  },
}));

mock.module("@/emails/send-email", () => ({
  sendEmail: async ({ to, subject }: { to: string; subject: string }) => {
    shared.emails.push({ to, subject });
    return true;
  },
}));

const { prisma } = await import("@/prisma");

const tables = (
  await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`
).map((row) => `"public"."${row.tablename}"`);

beforeEach(async () => {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
  shared.context = { user: null, cookies: new Map() };
  shared.emails.length = 0;
});
