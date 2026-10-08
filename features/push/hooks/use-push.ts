"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { subscribePush, unsubscribePush } from "../actions";
import {
  currentSubscription,
  installStore,
  isIOS,
  isStandalone,
  notificationPermission,
  pushApisAvailable,
  subscribeBrowser,
  unsubscribeBrowser,
} from "../client/pwa";
import { installMode, isIOSSafari, pushSupport, type PushSupport } from "../support";

export type PushConfig = { publicKey: string | null; devices: number };

/** Server side: VAPID public key (null = push off on this server) and the user's device count. */
export function usePushConfig() {
  return useQuery({ queryKey: queryKeys.me.push, queryFn: () => fetchJson<PushConfig>("/api/push/config"), staleTime: 5 * 60_000 });
}

/** What this browser can do (read in the browser only: the query never runs on the server). */
async function readDevice() {
  const subscription = await currentSubscription();
  return {
    apis: pushApisAvailable(),
    isIOS: isIOS(),
    iosSafari: isIOSSafari(navigator.userAgent, navigator.maxTouchPoints ?? 0),
    standalone: isStandalone(),
    permission: notificationPermission(),
    subscribed: subscription !== null,
  };
}

export function useDevicePush() {
  return useQuery({ queryKey: queryKeys.device.push, queryFn: readDevice, staleTime: 30_000 });
}

/**
 * Push on THIS device: its state (activé / bloqué / non supporté / à installer sur iPhone) and the
 * enable / disable actions. `enable` must be called from a click (permission prompt).
 */
export function usePush() {
  const queryClient = useQueryClient();
  const config = usePushConfig();
  const device = useDevicePush();

  const state: PushSupport | "loading" =
    !config.data || !device.data
      ? config.isError
        ? "unconfigured"
        : "loading"
      : pushSupport({
          hasServiceWorker: device.data.apis,
          hasPushManager: device.data.apis,
          hasNotification: device.data.apis,
          isIOS: device.data.isIOS,
          standalone: device.data.standalone,
          permission: device.data.permission,
          configured: config.data.publicKey !== null,
          subscribed: device.data.subscribed,
        });

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.device.push }),
      queryClient.invalidateQueries({ queryKey: queryKeys.me.push }),
    ]);

  const enable = useMutation({
    mutationFn: async () => {
      const publicKey = config.data?.publicKey;
      if (!publicKey) throw new Error("Les notifications ne sont pas disponibles pour le moment");
      const result = await subscribeBrowser(publicKey);
      if (!result.ok) {
        throw new Error(
          result.reason === "denied"
            ? "Notifications bloquées : autorise-les dans les réglages de ton navigateur"
            : "Impossible d'activer les notifications sur cet appareil",
        );
      }
      const saved = await subscribePush(result.subscription);
      if (!saved.success) throw new Error(saved.message);
      return saved.message;
    },
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(error.message),
    onSettled: refresh,
  });

  const disable = useMutation({
    mutationFn: async () => {
      const endpoint = await unsubscribeBrowser();
      if (endpoint) await unsubscribePush(endpoint);
      return "Notifications désactivées sur cet appareil";
    },
    onSuccess: (message) => toast.success(message),
    onSettled: refresh,
  });

  return { state, devices: config.data?.devices ?? 0, enable, disable, pending: enable.isPending || disable.isPending };
}

/** How the app can be installed on this device ("installed", "prompt", "ios", "manual"). */
export function useInstallMode() {
  const prompt = useSyncExternalStore(installStore.subscribe, installStore.snapshot, installStore.serverSnapshot);
  const { data: device } = useDevicePush();
  if (!device) return null;
  return installMode({
    standalone: device.standalone || prompt === "installed",
    canPrompt: prompt === "prompt",
    isIOS: device.isIOS,
  });
}
