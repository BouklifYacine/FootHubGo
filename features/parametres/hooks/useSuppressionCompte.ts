"use client";

import { useState } from "react";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { schemaVerificationMotDePasse } from "../schemas/schema";
import { DeconnexionClient } from "@/lib/FonctionDeconnexionClient";
import { useProfil } from "./useProfil";
import { verifierMotDePasse } from "../actions/verifiermotdepasseaction";
import { supprimerCompte } from "../actions/supprimercompte";
import { definirErreurChamp } from "../lib/definirErreurChamp";

export type DeleteAccountSteps = "verification" | "confirmation";

export function useSuppressionCompte(userId: string) {

  const [confirmation, setConfirmation] = useState(false);
  const [etape, setEtape] = useState<DeleteAccountSteps>("verification");

  // Formulaires
  const formVerification = useForm({
    defaultValues: {
      motdepasse: "",
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schemaVerificationMotDePasse },
    onSubmit: ({ value }) => {
      verifierMotDePasseMutation.mutate(value.motdepasse);
    },
  });

  const formConfirmation = useForm({
    defaultValues: {
      codeVerification: "",
    },
    onSubmit: async () => {
      await handleSuppression();
    },
  });

  const {data : utilisateur , isLoading} = useProfil(userId)

  const hasProvider =  utilisateur?.providerId[0] !== "credential";


  const verifierMotDePasseMutation = useMutation({
    mutationFn: async (motdepasse: string) => {
      const resultat = await verifierMotDePasse(motdepasse);
      if (resultat.error) throw new Error(resultat.error);
      return resultat;
    },
    onSuccess: () => {
      if (!hasProvider) {
        toast.success("Code de vérification envoyé par email");
      }
      setEtape("confirmation");
      formVerification.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
      definirErreurChamp(formVerification, "motdepasse", error.message);
    },
  });

  const supprimerCompteMutation = useMutation({
    mutationFn: async (codeVerification?: string) => {
      try {
        const resultat = await supprimerCompte(codeVerification);
        if (resultat?.error) throw new Error(resultat.error);
        return resultat;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Compte supprimé avec succès");
      DeconnexionClient()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  const startDeleteProcess = () => {
    setConfirmation(true);
    if (hasProvider) {
      setEtape("confirmation");
    }
  };

  const handleSuppression = async () => {
    if (hasProvider) {
      await supprimerCompteMutation.mutateAsync(undefined);
    } else {
      const data = formConfirmation.state.values;
      await supprimerCompteMutation.mutateAsync(data.codeVerification);
    }
  };

  const annuler = () => {
    setConfirmation(false);
    setEtape("verification");
    formVerification.reset();
    formConfirmation.reset();
  };

  return {
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
  };
}
