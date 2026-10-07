import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export const { signIn, signOut, useSession } = authClient;

/** Signs out then does a full page load, so no cached query data survives. */
export async function signOutAndRedirect(path = "/sign-in") {
  await authClient.signOut();
  window.location.assign(path);
}
