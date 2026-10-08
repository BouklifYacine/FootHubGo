import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { unsubscribePush } from "@/features/push/actions";
import { unsubscribeBrowser } from "@/features/push/client/pwa";

/** Best effort, at most 3 s: never blocks the sign-out. */
async function forgetPushSubscription() {
  const forget = async () => {
    const endpoint = await unsubscribeBrowser();
    if (endpoint) await unsubscribePush(endpoint);
  };
  await Promise.race([forget().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 3000))]);
}

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export const { signIn, signOut, useSession } = authClient;

/**
 * Signs out then does a full page load, so no cached query data survives. This browser's push
 * subscription is dropped first: a signed-out device must not keep receiving the user's pushes.
 */
export async function signOutAndRedirect(path = "/sign-in") {
  await forgetPushSubscription();
  await authClient.signOut();
  window.location.assign(path);
}
