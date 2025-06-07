import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaPseudo, schemaVerificationMotDePasse } from "../schemas/schema";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { verifierMotDePasse } from "../actions/verifiermotdepasseaction";
import { changerPseudo } from "../actions/changerpseudo";

interface PropsRequeteUtilisateur {
  message: string;
  providerId: string[];
}

type EtapeModification = "verification" | "changement";

export function useSectionPseudo(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient(); 

  const [estEnEdition, setEstEnEdition] = useState(false);
  const [etapeActuelle, setEtapeActuelle] =
    useState<EtapeModification>("verification");

  const { data: donneesCompteUtilisateur } = useQuery<PropsRequeteUtilisateur>({
    queryKey: ["profil", id],
    queryFn: async () => {
      const reponse = await fetch(`/api/user/accounts?userId=${id}`);
      if (!reponse.ok) throw new Error("Échec de la récupération des comptes");
      return reponse.json();
    },
  });

  const estCompteCredential =
    donneesCompteUtilisateur?.providerId?.[0] === "credential";
  const necessiteVerificationMotDePasse = estCompteCredential;

  const formulaireVerification = useForm({
    resolver: zodResolver(schemaVerificationMotDePasse),
    defaultValues: {
      motdepasse: "",
    },
  });

  const formulaireChangement = useForm({
    resolver: zodResolver(schemaPseudo),
    defaultValues: {
      pseudo: "",
      codeverification: "",
    },
  });

  const mutationVerifierMotDePasse = useMutation({
    mutationFn: async (motDePasse: string) => {
      const resultat = await verifierMotDePasse(motDePasse);
      if (resultat.error) throw new Error(resultat.error);
      return resultat;
    },
    onSuccess: () => {
      toast.success("Code de vérification envoyé par email");
      setEtapeActuelle("changement");
      formulaireVerification.reset();
    },
    onError: (erreur: Error) => {
      toast.error(erreur.message);
      formulaireVerification.setError("motdepasse", {
        message: erreur.message,
      });
    },
  });

  const mutationChangerPseudo = useMutation({
    mutationFn: async (donnees: {
      pseudo: string;
      codeverification: string;
    }) => {
      const resultat = await changerPseudo(donnees);
      if (resultat.error) throw new Error(resultat.error);
      return resultat;
    },
    onSuccess: () => {
      toast.success("Pseudo modifié avec succès");
      queryClient.invalidateQueries({
        queryKey: ['profil', id] // Invalide le profil utilisateur
      });
      annulerModification();
      router.refresh();
      router.push("/");
    },
    onError: (erreur: Error) => {
      if (erreur.message.includes("Code")) {
        formulaireChangement.setError("codeverification", {
          message: erreur.message,
        });
      } else {
        formulaireChangement.setError("pseudo", { message: erreur.message });
      }
      toast.error(erreur.message);
    },
  });

  const commencerEdition = () => setEstEnEdition(true);

  const annulerModification = () => {
    setEstEnEdition(false);
    setEtapeActuelle("verification");
    formulaireVerification.reset();
    formulaireChangement.reset();
  };

  const soumettreVerification = (donnees: { motdepasse: string }) => {
    mutationVerifierMotDePasse.mutate(donnees.motdepasse);
  };

  const soumettreChangement = (donnees: {
    pseudo: string;
    codeverification: string;
  }) => {
    mutationChangerPseudo.mutate(donnees);
  };

  return {
    estEnEdition,
    etapeActuelle,
    necessiteVerificationMotDePasse,

    formulaireVerification,
    formulaireChangement,

    mutationVerifierMotDePasse,
    mutationChangerPseudo,

    commencerEdition,
    annulerModification,
    soumettreVerification,
    soumettreChangement,
  };
}
