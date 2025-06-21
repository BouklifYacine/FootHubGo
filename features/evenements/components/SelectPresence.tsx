"use client";
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
import { usePresenceEvenementJoueur } from "../hooks/usePresenceEvenementJoueur";

type PresenceStatut = "ATTENTE" | "PRESENT" | "ABSENT";

interface SelectPresenceProps {
  id: string;
  className?: string;
  value: PresenceStatut;
}

function SelectPresence({ id, value, className = "" }: SelectPresenceProps) {
  console.log(value)
  const { mutate, isPending } = usePresenceEvenementJoueur();
  return (
    <Select
    value={value}
      onValueChange={(value) =>
        mutate({
          evenementid: id,
          data: { statut: value as PresenceStatut },
        })
      }
      disabled={isPending}
    >
      <SelectTrigger
        className={`w-[140px] my-5 mx-4 border border-black dark:border-white ${className}`}
      >
        <SelectValue placeholder="Présence" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Choisis une présence</SelectLabel>
          <SelectItem value="ATTENTE" className="text-orange-500 ">
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
