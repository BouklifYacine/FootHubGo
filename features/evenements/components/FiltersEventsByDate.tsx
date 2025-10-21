import React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FiltreEvent = "tous" | "avant" | "apres";

interface Props {
  onChangeFiltre: (filtre: FiltreEvent) => void;
}

function FiltersEventsByDate({onChangeFiltre} : Props) {
  return (
       <Select onValueChange={onChangeFiltre}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Date évenement" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Date événement</SelectLabel>
          <SelectItem value="tous">Tous </SelectItem>
          <SelectItem value="avant">Passés</SelectItem>
          <SelectItem value="apres">En cours </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}


export default FiltersEventsByDate