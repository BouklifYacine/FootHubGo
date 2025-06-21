import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PresenceStatut = "ATTENTE" | "PRESENT" | "ABSENT";

interface SelectPresenceProps {
  id: string;
  MutationPresenceJoueur: (params: {
    evenementid: string;
    data: { statut: PresenceStatut };
  }) => void;
  Pending: boolean;
  className?: string;
}

function SelectPresence({id,MutationPresenceJoueur,Pending,className = ""}: SelectPresenceProps) {
  return (
    <Select
      onValueChange={(value) =>
        MutationPresenceJoueur({
          evenementid: id,
          data: { statut: value as PresenceStatut },
        })
      }
      disabled={Pending}
    >
      <SelectTrigger
        className={`w-[140px] my-5 mx-4 border border-black dark:border-white ${className}`}
      >
        <SelectValue placeholder="Présence" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Choisis une présence</SelectLabel>
          <SelectItem value="ATTENTE">En Attente</SelectItem>
          <SelectItem value="ABSENT">Absent</SelectItem>
          <SelectItem value="PRESENT">Présent</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default SelectPresence;
