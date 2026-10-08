import { sendDueReminders } from "@/features/events/server/reminders";
import { closeDueMotmVotes, openDueMotmVotes } from "@/features/motm/server/jobs";

const EVERY_MINUTES = 10;

/**
 * Background jobs of the custom server (one Node process, see server.ts): event reminders and the
 * man-of-the-match votes (opening notification, winners).
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
    }
    try {
      const opened = await openDueMotmVotes();
      const closed = await closeDueMotmVotes();
      if (opened.notified + closed.winners > 0) {
        console.log(`[jobs] man of the match: ${opened.notified} voters notified, ${closed.winners} winners`);
      }
    } catch (error) {
      console.error("[jobs] man of the match failed", error);
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
