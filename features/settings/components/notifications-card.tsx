"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { updateNotificationPreferences } from "../actions";
import type { Profile } from "../hooks/use-profile";
import { InstallAppCard } from "@/features/push/components/install-app-card";
import { PushSettings } from "@/features/push/components/push-settings";
import { SettingsCard } from "./settings-card";

/** Push (this device + categories), the app install, then the emails. In-app notifications always stay on. */
export function NotificationsCard({ emailReminders, pushMutedCategories }: { emailReminders: boolean; pushMutedCategories: string[] }) {
  const mutation = useActionMutation(updateNotificationPreferences, {
    invalidate: [queryKeys.me.profile],
    optimistic: {
      queryKey: queryKeys.me.profile,
      update: (previous, input) => (previous ? { ...(previous as Profile), ...input } : previous),
    },
  });

  return (
    <div className="space-y-6">
    <SettingsCard title="Notifications sur ton téléphone" description="Convocations, rappels, covoiturage, messages : choisis ce qui te prévient">
      <div className="space-y-6">
        <PushSettings mutedCategories={pushMutedCategories} />
        <InstallAppCard showInstalled />
      </div>
    </SettingsCard>
    <SettingsCard title="Emails" description="Choisis les emails que tu reçois">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <Label htmlFor="email-reminders">Rappels d&apos;événements par email</Label>
          <p className="text-sm text-muted-foreground">
            La veille d&apos;un entraînement ou d&apos;un match où tu es attendu. Le rappel dans l&apos;application
            est toujours envoyé.
          </p>
        </div>
        <Switch
          id="email-reminders"
          checked={emailReminders}
          disabled={mutation.isPending}
          onCheckedChange={(checked) => mutation.mutate({ emailReminders: checked })}
        />
      </div>
    </SettingsCard>
    </div>
  );
}
