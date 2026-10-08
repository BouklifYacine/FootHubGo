/**
 * Database tests: runs tests/db/*.db.ts against a THROWAWAY PostgreSQL database.
 *
 *   bun run test:db                 # local: foothubgo_test on the dev PostgreSQL (docker-compose.dev.yml)
 *   TEST_DATABASE_URL=... bun run test:db
 *
 * The database name must end with "_test": every test empties all its tables. It is created when
 * missing and migrated (`prisma migrate deploy`), then `bun test` runs with tests/db/setup.ts preloaded.
 * Extra arguments are passed to `bun test` (e.g. `bun run test:db -t "invite code"`).
 */
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { SQL } from "bun";

const url = process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/foothubgo_test";
const database = decodeURIComponent(new URL(url).pathname.slice(1));
if (!/^[a-z0-9_]+_test$/.test(database)) {
  console.error(`TEST_DATABASE_URL must name a database ending with "_test" (got "${database}"): its tables are emptied.`);
  process.exit(1);
}

const adminUrl = new URL(url);
adminUrl.pathname = "/postgres";
const admin = new SQL(adminUrl.toString());
const [exists] = await admin`SELECT 1 FROM pg_database WHERE datname = ${database}`;
if (!exists) await admin.unsafe(`CREATE DATABASE "${database}"`);
await admin.close();

// Only the test database, and no external service: no email, no push, fake Stripe keys.
const env = {
  ...process.env,
  NODE_ENV: "test" as const,
  DATABASE_URL: url,
  DIRECT_URL: url,
  TEST_DATABASE_URL: url,
  DISABLE_JOBS: "1",
  RESEND_API_KEY: "",
  VAPID_PUBLIC_KEY: "",
  VAPID_PRIVATE_KEY: "",
  VAPID_SUBJECT: "",
  STRIPE_SECRET_KEY: "sk_test_db_tests",
  STRIPE_WEBHOOK_SECRET: "whsec_db_tests",
  STRIPE_MONTHLY_PRICE_ID: "price_month_test",
  STRIPE_YEARLY_PRICE_ID: "price_year_test",
};

const run = (args: string[]) => spawnSync(process.execPath, args, { env, stdio: "inherit" }).status ?? 1;

if (run(["x", "prisma", "migrate", "deploy"]) !== 0) process.exit(1);

const files = readdirSync("tests/db")
  .filter((file) => file.endsWith(".db.ts"))
  .sort()
  .map((file) => `./tests/db/${file}`);
process.exit(run(["test", "--preload", "./tests/db/setup.ts", ...files, ...process.argv.slice(2)]));
