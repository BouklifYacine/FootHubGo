import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brush, Eraser, Scissors, SwatchBook } from "lucide-react";
import { useId } from "react";

function RadioGroupBlock() {
  const id = useId();

  const items = [
    { value: "1", label: "Palette", Icon: SwatchBook },
    { value: "2", label: "Brush", Icon: Brush },
    { value: "3", label: "Eraser", Icon: Eraser },
    { value: "4", label: "Cut", Icon: Scissors },
  ];

  return (
    <RadioGroup className="grid-cols-2 min-w-[300px] max-w-[400px]" defaultValue="1">
      {items.map((item) => (
        <div
          key={`${id}-${item.value}`}
          className="relative flex flex-col gap-4 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
        >
          <div className="flex justify-between gap-2">
            <RadioGroupItem
              id={`${id}-${item.value}`}
              value={item.value}
              className="order-1 after:absolute after:inset-0"
            />
            <item.Icon className="opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
          </div>
          <Label htmlFor={`${id}-${item.value}`}>{item.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}

export { RadioGroupBlock };
