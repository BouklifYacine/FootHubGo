/**
 * Push support of the current browser (pure: the caller reads `navigator` / `window`).
 * iOS: Web Push only works in the app added to the home screen (iOS 16.4+), never in a Safari tab.
 */
export type PushSupport =
  | "unsupported" // no service worker / Push API (old browser, Firefox private window...)
  | "ios-needs-install" // iPhone / iPad in a browser tab: install first
  | "unconfigured" // the server has no VAPID keys (push disabled on this instance)
  | "denied" // the user blocked notifications for the site
  | "enabled" // this device is subscribed
  | "disabled"; // possible, not turned on yet

export type BrowserFacts = {
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasNotification: boolean;
  isIOS: boolean;
  standalone: boolean;
  permission: "default" | "granted" | "denied";
  configured: boolean;
  subscribed: boolean;
};

export function pushSupport(facts: BrowserFacts): PushSupport {
  if (facts.isIOS && !facts.standalone) return "ios-needs-install";
  if (!facts.hasServiceWorker || !facts.hasPushManager || !facts.hasNotification) return "unsupported";
  if (!facts.configured) return "unconfigured";
  if (facts.permission === "denied") return "denied";
  return facts.subscribed && facts.permission === "granted" ? "enabled" : "disabled";
}

/** iPhone / iPad (iPadOS presents itself as a Mac with a touch screen). */
export function isIOSDevice(userAgent: string, maxTouchPoints: number) {
  return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
}

/** Safari on iOS (not Chrome / Firefox / Edge for iOS, which use another install path). */
export function isIOSSafari(userAgent: string, maxTouchPoints: number) {
  return isIOSDevice(userAgent, maxTouchPoints) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
}

/** How the app can be installed here, for the install card. */
export type InstallMode = "installed" | "prompt" | "ios" | "manual";

export function installMode(input: { standalone: boolean; canPrompt: boolean; isIOS: boolean }): InstallMode {
  if (input.standalone) return "installed";
  if (input.canPrompt) return "prompt";
  return input.isIOS ? "ios" : "manual";
}
