"use client";

import { useCreerPresence, useModifierPresence } from "../../(hooks)/usePresence";
import { StatutPresence } from "../../(interface-types)/Presence";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, HelpCircle, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PresenceEvenementFormProps {
  evenementId: string;
  statutActuel?: StatutPresence;
}

export default function PresenceEvenementForm({
  evenementId,
  statutActuel = "EN_ATTENTE",
}: PresenceEvenementFormProps) {
  const { mutate: creerPresence, isPending: isCreationEnCours } = useCreerPresence();
  const { mutate: modifierPresence, isPending: isModificationEnCours } = useModifierPresence();
  const [statutLocal, setStatutLocal] = useState<StatutPresence>(statutActuel);
  const [presenceExiste, setPresenceExiste] = useState(statutActuel !== "EN_ATTENTE");
  
  useEffect(() => {
    setStatutLocal(statutActuel);
    setPresenceExiste(statutActuel !== "EN_ATTENTE");
  }, [statutActuel]);

  // Options de statut avec leurs propriétés
  const optionsStatut = [
    {
      value: "PRESENT" as StatutPresence,
      label: "Présent",
      icon: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
    },
    {
      value: "ABSENT" as StatutPresence,
      label: "Absent",
      icon: <XCircle className="h-4 w-4 mr-2 text-red-500" />,
    },
    {
      value: "INCERTAIN" as StatutPresence,
      label: "Incertain",
      icon: <HelpCircle className="h-4 w-4 mr-2 text-yellow-500" />,
    },
    {
      value: "EN_ATTENTE" as StatutPresence,
      label: "En attente",
      icon: <Clock className="h-4 w-4 mr-2 text-gray-500" />,
    },
  ];

  // Fonction pour obtenir l'option de statut par valeur
  const getOptionByValue = (value: StatutPresence) => {
    return optionsStatut.find(option => option.value === value) || optionsStatut[3]; // Default to EN_ATTENTE
  };

  // Cette fonction va mettre à jour le statut et soumettre la présence
  const mettreAJourStatut = (nouveauStatut: StatutPresence) => {
    // Si le statut est déjà celui qu'on veut mettre, on ne fait rien
    if (nouveauStatut === statutLocal) return;

    // Mettre à jour l'état local immédiatement pour réactivité de l'UI
    setStatutLocal(nouveauStatut);

    const params = { evenementId, statut: nouveauStatut };
    
    if (presenceExiste) {
      modifierPresence(params, {
        onSuccess: (resultat) => {
          if (resultat.success) {
            toast.success(resultat.message);
          } else {
            setStatutLocal(statutActuel);
            toast.error(resultat.message);
          }
        },
        onError: () => {
          setStatutLocal(statutActuel);
          toast.error("Erreur lors de la modification de votre présence");
        },
      });
    } else {
      creerPresence(params, {
        onSuccess: (resultat) => {
          if (resultat.success) {
            toast.success(resultat.message);
            setPresenceExiste(true);
          } else {
            setStatutLocal(statutActuel);
            toast.error(resultat.message);
          }
        },
        onError: () => {
          setStatutLocal(statutActuel);
          toast.error("Erreur lors de l'enregistrement de votre présence");
        },
      });
    }
  };

  // Affichage du statut actuel
  const currentOption = getOptionByValue(statutLocal);
  const isPending = isCreationEnCours || isModificationEnCours;

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium whitespace-nowrap">Ma présence:</label>
      
      {isPending ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Mise à jour...</span>
        </div>
      ) : (
        <Select
          value={statutLocal}
          onValueChange={(value) => mettreAJourStatut(value as StatutPresence)}
          disabled={isPending}
        >
          <SelectTrigger className="w-auto min-w-[140px]">
            <SelectValue>
              <div className="flex items-center">
                {currentOption.icon}
                <span>{currentOption.label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {optionsStatut.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
} 