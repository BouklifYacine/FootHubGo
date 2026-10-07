"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/features/auth/components/password-field";
import { signOutAndRedirect } from "@/lib/auth-client";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { deleteAccount } from "../actions";
import { SettingsCard } from "./settings-card";

export function DeleteAccountCard({ hasPassword }: { hasPassword: boolean }) {
  const [password, setPassword] = useState("");
  const mutation = useActionMutation(deleteAccount, { onSuccess: () => signOutAndRedirect("/") });

  return (
    <SettingsCard
      danger
      title="Supprimer le compte"
      description="Cette action est irréversible. Toutes vos données seront définitivement supprimées."
    >
      <AlertDialog onOpenChange={() => setPassword("")}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Supprimer mon compte</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Votre compte, votre abonnement et toutes vos données seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {hasPassword && (
            <PasswordInput
              placeholder="Mot de passe actuel"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={mutation.isPending || (hasPassword && !password)}
              onClick={() => mutation.mutate({ password })}
            >
              {mutation.isPending ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsCard>
  );
}
