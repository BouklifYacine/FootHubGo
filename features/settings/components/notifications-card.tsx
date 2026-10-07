"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { updateNotificationPreferences } from "../actions";
import type { Profile } from "../hooks/use-profile";
import { SettingsCard } from "./settings-card";

/** Email preferences. In-app notifications always stay on. */
export function NotificationsCard({ emailReminders }: { emailReminders: boolean }) {
  const mutation = useActionMutation(updateNotificationPreferences, {
    invalidate: [queryKeys.me.profile],
    optimistic: {
      queryKey: queryKeys.me.profile,
      update: (previous, input) => (previous ? { ...(previous as Profile), ...input } : previous),
    },
  });

  return (
    <SettingsCard title="Notifications" description="Choisissez les emails que vous recevez">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <Label htmlFor="email-reminders">Rappels d&apos;événements par email</Label>
          <p className="text-sm text-muted-foreground">
            La veille d&apos;un entraînement ou d&apos;un match où vous êtes attendu. Le rappel dans l&apos;application
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
  );
}
