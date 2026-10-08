"use client";

/**
 * Browser side of the PWA: service worker registration, install prompt, Web Push subscription.
 * Every function is safe to call on any browser (feature-detected, never throws on missing APIs).
 */

import { isIOSDevice } from "../support";

export const SW_URL = "/sw.js";

/** Remembers on this device that the user turned push on (re-subscribed silently if it expired). */
const WANTED_KEY = "fhg-push-wanted";

export function readLocal(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Private mode / storage blocked: the feature still works for this visit.
  }
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS() {
  return typeof navigator !== "undefined" && isIOSDevice(navigator.userAgent, navigator.maxTouchPoints ?? 0);
}

export function pushApisAvailable() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function notificationPermission(): NotificationPermission {
  return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default";
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(SW_URL, { scope: "/", updateViaCache: "none" });
  } catch (error) {
    console.warn("[pwa] service worker registration failed", error);
    return null;
  }
}

async function readyRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration("/")) ?? (await registerServiceWorker());
}

export async function currentSubscription() {
  if (!pushApisAvailable()) return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  return (await registration?.pushManager.getSubscription()) ?? null;
}

function base64UrlToBytes(value: string) {
  const padded = (value + "=".repeat((4 - (value.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function sameKey(subscription: PushSubscription, publicKey: string) {
  const current = subscription.options?.applicationServerKey;
  if (!current) return true;
  const expected = base64UrlToBytes(publicKey);
  const actual = new Uint8Array(current);
  return actual.length === expected.length && actual.every((byte, i) => byte === expected[i]);
}

export type SubscriptionJson = { endpoint: string; keys: { p256dh: string; auth: string } };

function toJson(subscription: PushSubscription): SubscriptionJson {
  const json = subscription.toJSON();
  return { endpoint: json.endpoint ?? subscription.endpoint, keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" } };
}

/**
 * Asks the permission (MUST run from a user gesture) and subscribes this browser.
 * Returns the subscription to send to the server, or the reason it failed.
 */
export async function subscribeBrowser(publicKey: string): Promise<{ ok: true; subscription: SubscriptionJson } | { ok: false; reason: "denied" | "error" }> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { ok: false, reason: permission === "denied" ? "denied" : "error" };
    const registration = await readyRegistration();
    if (!registration) return { ok: false, reason: "error" };
    await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (subscription && !sameKey(subscription, publicKey)) {
      await subscription.unsubscribe();
      subscription = null;
    }
    subscription ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(publicKey) });
    writeLocal(WANTED_KEY, "1");
    return { ok: true, subscription: toJson(subscription) };
  } catch (error) {
    console.warn("[pwa] push subscription failed", error);
    return { ok: false, reason: "error" };
  }
}

/** Unsubscribes this browser; returns the endpoint the server must forget (null if none). */
export async function unsubscribeBrowser() {
  writeLocal(WANTED_KEY, null);
  try {
    const subscription = await currentSubscription();
    if (!subscription) return null;
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    return endpoint;
  } catch {
    return null;
  }
}

/** sessionStorage flag: this tab already handed its subscription to the server. */
export const PUSH_SYNCED_KEY = "fhg-push-synced";

/**
 * Called on the sign-in page: the next signed-in visit hands the subscription back to the server
 * (a password change or reset deleted it there, along with the sessions).
 */
export function resetPushSync() {
  try {
    window.sessionStorage.removeItem(PUSH_SYNCED_KEY);
  } catch {
    // storage blocked: nothing was stored either
  }
}

/**
 * On app start: when the user turned push on here and the permission is still granted, make sure
 * the subscription exists (it can expire, or the server key can change) and give it to the server.
 * Returns the subscription to sync, or null when there is nothing to do.
 */
export async function subscriptionToSync(publicKey: string): Promise<SubscriptionJson | null> {
  if (!pushApisAvailable() || notificationPermission() !== "granted") return null;
  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    if (!registration) return null;
    let subscription = await registration.pushManager.getSubscription();
    if (subscription && !sameKey(subscription, publicKey)) {
      await subscription.unsubscribe();
      subscription = null;
    }
    if (!subscription) {
      if (readLocal(WANTED_KEY) !== "1") return null;
      subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(publicKey) });
    }
    return toJson(subscription);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ install prompt (Chromium)

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** Started once by the app shell: keeps the browser's install prompt for the "Installer" button. */
export function listenForInstallPrompt() {
  if (typeof window === "undefined") return () => {};
  const onPrompt = (event: Event) => {
    event.preventDefault(); // no mini-infobar: the app shows its own button
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  };
  const onInstalled = () => {
    deferredPrompt = null;
    installed = true;
    notify();
  };
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

export const installStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** "prompt" when the browser offered an install prompt, "installed" right after installing. */
  snapshot(): "none" | "prompt" | "installed" {
    return installed ? "installed" : deferredPrompt ? "prompt" : "none";
  },
  serverSnapshot: (): "none" | "prompt" | "installed" => "none",
};

export async function promptInstall() {
  const event = deferredPrompt;
  if (!event) return false;
  deferredPrompt = null;
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
}
