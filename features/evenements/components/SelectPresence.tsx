"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePresenceEvenementJoueur } from "../hooks/usePresenceEvenementJoueur";
import { $Enums } from "@prisma/client";
import dayjs from 'dayjs';

type PresenceStatut = "ATTENTE" | "PRESENT" | "ABSENT";

interface SelectPresenceProps {
  id: string;
  date: Date
  value: PresenceStatut;
  typeEvent: $Enums.TypeEvenement
}

function SelectPresence({typeEvent, id, value, date }: SelectPresenceProps) {
  const { mutate, isPending } = usePresenceEvenementJoueur();

   const disabled = typeEvent !== "ENTRAINEMENT" || isPending;

  return (
    <Select
    value={value}
      onValueChange={(value) =>
        mutate({
          evenementid: id,
          data: { statut: value as PresenceStatut },
        })
      }
      disabled={disabled || dayjs(date).isBefore(dayjs())
}
    >
      <SelectTrigger
        className={`w-[140px] my-5 mx-4 border border-black dark:border-white `}
      >
        <SelectValue placeholder="Présence" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Choisis une présence</SelectLabel>
          <SelectItem value="ATTENTE" className=" ">
            En Attente
          </SelectItem>
          <SelectItem value="ABSENT" className="text-red-500 ">
            Absent
          </SelectItem>
          <SelectItem value="PRESENT" className="text-green-500">
            Présent{" "}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default SelectPresence;
