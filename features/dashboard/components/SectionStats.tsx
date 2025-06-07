import { CreditCard, UserPlus, Users, Landmark, UserRound } from "lucide-react";
import { StatsBlock } from "./Block";

interface StatsHeaderProps {
  statistiques: {
    totalUtilisateurs: number;
    totalAbonnements: number;
    totalRevenus: number;
  };
  MRR: number;
  RevenusParUtilisateurs: number;
}

export const SectionStats: React.FC<StatsHeaderProps> = ({
  statistiques,
  MRR,
  RevenusParUtilisateurs,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 mt-4">
      <StatsBlock
        icon={Users}
        title="Nombre utilisateurs"
        value={statistiques.totalUtilisateurs.toString()}
      />
      <StatsBlock
        icon={UserPlus}
        title="Nombre abonnés"
        value={statistiques.totalAbonnements.toString()}
      />
      <StatsBlock
        icon={Landmark}
        title="Revenus total"
        value={`${statistiques.totalRevenus}€`}
      />
      <StatsBlock 
        icon={CreditCard} 
        title="MRR" 
        value={`${MRR}€`} 
      />
      <StatsBlock
        icon={UserRound}
        title="Revenus/users"
        value={`${RevenusParUtilisateurs}€`}
      />
    </div>
  );
};