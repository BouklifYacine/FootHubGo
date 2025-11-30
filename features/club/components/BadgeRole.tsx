import { Badge } from "@/components/ui/badge";

interface BadgeRoleProps {
  role: string;
}

export function BadgeRole({ role }: BadgeRoleProps) {
  return (
    <Badge
      className={`text-md ${
        role === "ENTRAINEUR"
          ? "bg-emerald-500 text-white"
          : "bg-sky-500 text-white"
      }`}
    >
      {role === "ENTRAINEUR" ? "Entraîneur" : "Joueur"}
    </Badge>
  );
}
