"use client";

import { useEffect } from "react";
import { subscribePush } from "../actions";
import { listenForInstallPrompt, PUSH_SYNCED_KEY, registerServiceWorker, subscriptionToSync } from "../client/pwa";
import { usePushConfig } from "../hooks/use-push";

/**
 * Mounted once by the app shell (signed-in pages only): registers the service worker, keeps the
 * install prompt for the "Installer" button, and once per visit hands this device's push
 * subscription back to the server (it may have expired, or another account used this browser).
 * Never asks for a permission. Renders nothing.
 */
export function PwaSetup() {
  const { data: config } = usePushConfig();
  const publicKey = config?.publicKey ?? null;

  useEffect(() => {
    void registerServiceWorker();
    return listenForInstallPrompt();
  }, []);

  useEffect(() => {
    if (!publicKey) return;
    try {
      if (window.sessionStorage.getItem(PUSH_SYNCED_KEY) === publicKey) return;
      window.sessionStorage.setItem(PUSH_SYNCED_KEY, publicKey);
    } catch {
      // storage blocked: sync anyway (cheap, rate limited server side)
    }
    void subscriptionToSync(publicKey).then((subscription) => (subscription ? subscribePush(subscription) : null));
  }, [publicKey]);

  return null;
}
