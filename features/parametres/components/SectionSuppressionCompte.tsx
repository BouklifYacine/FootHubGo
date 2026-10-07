"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputPassword } from "./InputPassword";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useSuppressionCompte } from "../hooks/useSuppressionCompte";

export function SectionSuppression({ userId }: { userId: string }) {
  const {
    confirmation,
    etape,
    hasProvider,
    isLoading,
    formVerification,
    formConfirmation,
    verifierMotDePasseMutation,
    supprimerCompteMutation,
    startDeleteProcess,
    handleSuppression,
    annuler,
  } = useSuppressionCompte(userId);

  if (isLoading) {
    return (
      <Card className="p-6 border-destructive">
        <div>Chargement...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-destructive">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-red-500 ">
            Supprimer le compte
          </h2>
          <p className="text-sm text-gray-500">
            Cette action est irréversible. Toutes vos données seront
            définitivement supprimées.
          </p>
        </div>

        {!confirmation ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-red-500 text-white hover:bg-red-700 cursor-pointer">Supprimer mon compte</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est définitive et irréversible. Toutes vos
                  données seront supprimées de nos serveurs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={startDeleteProcess}
                  className="bg-red-500 text-white hover:bg-red-700 cursor-pointer"
                >
                  Continuer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div className="space-y-4">
            {!hasProvider && etape === "verification" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  formVerification.handleSubmit();
                }}
                className="space-y-4"
              >
                <formVerification.Field name="motdepasse">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="motdepasse">Mot de passe actuel</Label>
                      <InputPassword
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {field.state.meta.errors[0]?.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </formVerification.Field>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={verifierMotDePasseMutation.isPending}
                  >
                    {verifierMotDePasseMutation.isPending
                      ? "Vérification..."
                      : "Continuer"}
                  </Button>
                  <Button type="button" variant="outline" onClick={annuler}>
                    Annuler
                  </Button>
                </div>
              </form>
            )}

            {etape === "confirmation" && (
              <div className="space-y-4">
                {!hasProvider ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      formConfirmation.handleSubmit();
                    }}
                    className="space-y-4"
                  >
                    <formConfirmation.Field name="codeVerification">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="codeVerification">
                            Code de vérification
                          </Label>
                          <Input
                            id="codeVerification"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Entrez le code reçu par email"
                          />
                        </div>
                      )}
                    </formConfirmation.Field>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={supprimerCompteMutation.isPending}
                      >
                        {supprimerCompteMutation.isPending
                          ? "Suppression en cours..."
                          : "Confirmer la suppression"}
                      </Button>
                      <Button type="button" variant="outline" onClick={annuler}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      className="bg-red-500 text-white hover:bg-red-700 cursor-pointer"
                      disabled={supprimerCompteMutation.isPending}
                      onClick={() => handleSuppression()}
                    >
                      {supprimerCompteMutation.isPending
                        ? "Suppression en cours..."
                        : "Confirmer la suppression"}
                    </Button>
                    <Button variant="outline" onClick={annuler}>
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
