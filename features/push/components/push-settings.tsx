"use client";

import { AlertTriangle, BellOff, CheckCircle2, Smartphone } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import type { Profile } from "@/features/settings/hooks/use-profile";
import { setPushCategory } from "../actions";
import { PUSH_CATEGORIES, PUSH_CATEGORY_LABELS, wantsPush } from "../categories";
import { usePush } from "../hooks/use-push";
import type { PushSupport } from "../support";

const STATE_TEXT: Record<Exclude<PushSupport, "enabled" | "disabled">, { icon: typeof AlertTriangle; text: string }> = {
  denied: {
    icon: BellOff,
    text: "Bloquées dans ton navigateur. Pour les réactiver : touche le cadenas à gauche de l'adresse (ou les réglages du site), autorise « Notifications », puis recharge la page. Sur une app installée : Réglages du téléphone → Notifications → FootHubGo.",
  },
  unsupported: {
    icon: AlertTriangle,
    text: "Ce navigateur ne permet pas les notifications. Essaie avec Chrome, Edge, Firefox ou Safari à jour.",
  },
  "ios-needs-install": {
    icon: Smartphone,
    text: "Sur iPhone (iOS 16.4 ou plus), les notifications marchent seulement depuis l'app ajoutée à l'écran d'accueil : Safari → Partager → « Sur l'écran d'accueil », puis ouvre FootHubGo depuis son icône et reviens ici.",
  },
  unconfigured: { icon: AlertTriangle, text: "Les notifications ne sont pas disponibles sur ce serveur pour le moment." },
};

/** Push on this device (on / off with clear states) + the categories (for every device). */
export function PushSettings({ mutedCategories }: { mutedCategories: string[] }) {
  const push = usePush();
  const category = useActionMutation(setPushCategory, {
    toast: "errors",
    invalidate: [queryKeys.me.profile],
    optimistic: {
      queryKey: queryKeys.me.profile,
      update: (previous, input) => {
        const profile = previous as Profile | undefined;
        if (!profile) return previous;
        const rest = profile.pushMutedCategories.filter((value) => value !== input.category);
        return { ...profile, pushMutedCategories: input.enabled ? rest : [...rest, input.category] };
      },
    },
  });
  const enabled = push.state === "enabled";
  const canToggle = enabled || push.state === "disabled";
  const notice = push.state !== "loading" && !canToggle ? STATE_TEXT[push.state as keyof typeof STATE_TEXT] : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <Label htmlFor="push-device">Notifications sur cet appareil</Label>
          <p className="text-sm text-muted-foreground">
            {enabled ? (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircle2 className="size-4" aria-hidden /> Activées
              </span>
            ) : (
              "Reçois les notifications même quand l'application est fermée."
            )}
            {push.devices > 1 && ` (${push.devices} appareils au total)`}
          </p>
        </div>
        <Switch
          id="push-device"
          checked={enabled}
          disabled={!canToggle || push.pending}
          onCheckedChange={(checked) => (checked ? push.enable.mutate() : push.disable.mutate())}
        />
      </div>

      {notice && (
        <p className="flex gap-2 rounded-lg bg-muted p-3 text-sm" role="status" data-testid="push-state">
          <notice.icon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <span>{notice.text}</span>
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-medium">Je veux être prévenu pour</legend>
        {PUSH_CATEGORIES.map((value) => (
          <div key={value} className="flex items-start justify-between gap-4">
            <div className="grid gap-0.5">
              <Label htmlFor={`push-${value}`}>{PUSH_CATEGORY_LABELS[value].label}</Label>
              <p className="text-sm text-muted-foreground">{PUSH_CATEGORY_LABELS[value].description}</p>
            </div>
            <Switch
              id={`push-${value}`}
              checked={wantsPush(value, mutedCategories)}
              onCheckedChange={(checked) => category.mutate({ category: value, enabled: checked })}
            />
          </div>
        ))}
      </fieldset>
    </div>
  );
}
