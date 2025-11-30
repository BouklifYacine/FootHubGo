import { Badge } from "@/components/ui/badge";
import { CircleCheck, CircleX } from "lucide-react";

interface BadgeStatutProps {
  statut: boolean;
  label: string;
  type: "blessure" | "licence";
}

export function BadgeStatut({ statut, label, type }: BadgeStatutProps) {

  const isPositive = statut;

  return (
    <Badge
      className={`rounded-md border text-md ${
        isPositive
          ? "border-emerald-800 bg-emerald-100 text-emerald-800"
          : "border-red-800 bg-red-200 text-red-800"
      }`}
    >
      {isPositive ? (
        <CircleCheck size={16} className="mr-1" />
      ) : (
        <CircleX size={16} className="mr-1" />
      )}
      {label}
    </Badge>
  );
}
