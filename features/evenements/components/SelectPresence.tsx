import React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SelectPresence() {
  return (
    <>
     <Select >
          <SelectTrigger className="w-[140px] my-5 mx-4 border border-black dark:border-white">
            <SelectValue placeholder="Présence" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Choisis une présence</SelectLabel>
              <SelectItem value="apple" >En Attente</SelectItem>
              <SelectItem value="banana" >Absent</SelectItem>
              <SelectItem value="blueberry">Présent</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
    </>
  )
}

export default SelectPresence