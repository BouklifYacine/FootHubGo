/**
 * VAPID keys (server identity towards the push services), from the environment only.
 * Generate them once with `bunx web-push generate-vapid-keys`. Without them push is simply
 * disabled (the Docker image is built without secrets): the app works, the settings say so.
 */
export type VapidConfig = { publicKey: string; privateKey: string; subject: string };

export function vapidConfig(env: Record<string, string | undefined> = process.env): VapidConfig | null {
  const publicKey = env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = env.VAPID_PRIVATE_KEY?.trim();
  const subject = env.VAPID_SUBJECT?.trim();
  if (!publicKey || !privateKey || !subject) return null;
  if (!/^(mailto:|https:\/\/)/.test(subject)) return null;
  return { publicKey, privateKey, subject };
}

let warned = false;

/** The config, or null with one warning in the logs when push is not configured. */
export function pushConfig() {
  const config = vapidConfig();
  if (!config && !warned) {
    warned = true;
    console.info("[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT not set: push notifications disabled");
  }
  return config;
}
