import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectLangue {
  value: string;
  onValueChange: (value: string) => void;
}

export function LangueSelect({ value, onValueChange }: SelectLangue) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] bg-blue-500">
        <SelectValue placeholder="Sélectionner la langue" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fr" className="text-black cursor-pointer">Français </SelectItem>
        <SelectItem value="en" className="text-black cursor-pointer">English </SelectItem>
      </SelectContent>
    </Select>
  );
}