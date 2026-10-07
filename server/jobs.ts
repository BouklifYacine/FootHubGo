import { sendDueReminders } from "@/features/events/server/reminders";

const EVERY_MINUTES = 10;

/**
 * Background jobs of the custom server (one Node process, see server.ts).
 * Jobs are idempotent (reminders are claimed in the DB), so a second instance or an overlapping
 * run is harmless. Set DISABLE_JOBS=1 to run them elsewhere (e.g. a separate worker).
 */
export function startJobs() {
  if (process.env.DISABLE_JOBS === "1") return () => {};

  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      const result = await sendDueReminders();
      if (result.recipients > 0) console.log(`[jobs] reminders: ${result.events} events, ${result.recipients} recipients`);
    } catch (error) {
      console.error("[jobs] reminders failed", error);
    } finally {
      running = false;
    }
  };

  const first = setTimeout(run, 30_000);
  const timer = setInterval(run, EVERY_MINUTES * 60_000);
  return () => {
    clearTimeout(first);
    clearInterval(timer);
  };
}
