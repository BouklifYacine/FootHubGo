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

type FiltreEventType = "tous" | "CHAMPIONNAT" | "ENTRAINEMENT" | "COUPE";

interface Props {
  onChangeFiltre: (filtre: FiltreEventType) => void;
}

function FiltersEventsByType({onChangeFiltre} : Props) {
  return (
    <Select onValueChange={onChangeFiltre}>
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="Type entrainement" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Type événement</SelectLabel>
          <SelectItem value="tous">Tous </SelectItem>
          <SelectItem value="CHAMPIONNAT">Championnat</SelectItem>
          <SelectItem value="COUPE">Coupe </SelectItem>
          <SelectItem value="ENTRAINEMENT">Entrainement </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default FiltersEventsByType
