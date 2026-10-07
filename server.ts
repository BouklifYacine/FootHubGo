import { createServer } from "node:http";
import next from "next";
import { startJobs } from "@/server/jobs";
import { attachRealtime } from "@/server/realtime";

/**
 * Custom server: Next.js and Socket.IO share one HTTP server and one process,
 * so server actions can push realtime events directly (see server/realtime/emitter.ts).
 */
const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = attachRealtime(httpServer);
  const stopJobs = startJobs();

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

  const shutdown = (signal: string) => {
    console.log(`> ${signal} received, shutting down`);
    stopJobs();
    // io.close() also closes the underlying HTTP server.
    io.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
});
