import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { schemaPseudo, schemaVerificationMotDePasse } from "../schemas/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { verifierMotDePasse } from "../actions/verifiermotdepasseaction";
import { changerPseudo } from "../actions/changerpseudo";
import { definirErreurChamp } from "../lib/definirErreurChamp";

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
    defaultValues: {
      motdepasse: "",
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schemaVerificationMotDePasse },
    onSubmit: ({ value }) => {
      mutationVerifierMotDePasse.mutate(value.motdepasse);
    },
  });

  const formulaireChangement = useForm({
    defaultValues: {
      pseudo: "",
      codeverification: "",
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schemaPseudo },
    onSubmit: ({ value }) => {
      mutationChangerPseudo.mutate(value);
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
      definirErreurChamp(formulaireVerification, "motdepasse", erreur.message);
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
        definirErreurChamp(
          formulaireChangement,
          "codeverification",
          erreur.message
        );
      } else {
        definirErreurChamp(formulaireChangement, "pseudo", erreur.message);
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
  };
}
