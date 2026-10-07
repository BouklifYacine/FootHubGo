import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 ne charge plus le .env automatiquement : dotenv s'en charge.
// process.env (et pas env()) pour que `prisma generate` passe sans DATABASE_URL (build Docker).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
