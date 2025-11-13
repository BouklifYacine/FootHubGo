import React from "react";
import { $Enums } from "@prisma/client";
import { StatistiqueJoueur } from "@/features/stats/statsjoueur/interface-types/interfacetype";
import { StatistiqueEquipeID } from "@/features/stats/statsequipe/interface/InterfaceStatsEquipe";
import Link from "next/link";
import {
  ChartNoAxesCombined,
  Star,
  ThumbsDown,
  BarChart3,
  Target,
  TrendingUp,
  Award,
} from "lucide-react";

interface Props {
  Role: $Enums.RoleEquipe | undefined;
  statsJoueurData: StatistiqueJoueur | undefined;
  StatsEquipeData: StatistiqueEquipeID | undefined;
}

function StatsPrincipal({ Role, statsJoueurData, StatsEquipeData }: Props) {
  const coach = Role === "ENTRAINEUR";

  const statsPlayer = statsJoueurData?.statsjoueur;
  const statsTeam = StatsEquipeData?.statsequipe;

  // Vérifier si les stats existent et s'il y a des matchs
  const hasNoStats = coach
    ? !statsTeam || statsTeam.totalMatch === 0
    : !statsPlayer || statsPlayer.totalmatch === 0;

  if (hasNoStats) {
    return (
      <div className="flex items-center justify-center w-full h-full py-8 lg:py-12">
        <div className="flex flex-col items-center gap-3 lg:gap-4 text-center px-4">
          <BarChart3 className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400 dark:text-gray-600" />
          <p className="text-base lg:text-lg font-semibold text-gray-600 dark:text-gray-400">
            Aucune statistique disponible
          </p>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
            Les statistiques apparaîtront après les premiers matchs joués
          </p>
        </div>
      </div>
    );
  }

  // Configuration des stats selon le rôle
  const statsConfig = coach
    ? [
        {
          icon: TrendingUp,
          label: "Taux Victoire",
          value: `${statsTeam?.tauxVictoire}%`,
        },
        {
          icon: ThumbsDown,
          label: "Total Défaites",
          value: statsTeam?.totalDefaites,
        },
        {
          icon: BarChart3,
          label: "Total Matchs",
          value: statsTeam?.totalMatch,
        },
        {
          icon: Target,
          label: "Total Points",
          value: statsTeam?.totalPoints,
        },
        {
          icon: Award,
          label: "Total Victoires",
          value: statsTeam?.totalVictoires,
        },
        {
          icon: ChartNoAxesCombined,
          label: "Taux Victoire",
          value: `${statsTeam?.tauxVictoire}%`,
        },
      ]
    : [
        {
          icon: Target,
          label: "Total Buts",
          value: statsPlayer?.totalbuts,
        },
        {
          icon: Star,
          label: "Note Moyenne",
          value: statsPlayer?.notemoyenne.toFixed(2),
        },
        {
          icon: BarChart3,
          label: "Total Matchs",
          value: statsPlayer?.totalmatch,
        },
        {
          icon: Star,
          label: "Note Moyenne",
          value: statsPlayer?.notemoyenne.toFixed(2),
        },
        {
          icon: Target,
          label: "Total Buts",
          value: statsPlayer?.totalbuts,
        },
        {
          icon: TrendingUp,
          label: "Total G+A",
          value: statsPlayer?.totalcontribution,
        },
      ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-end mb-4 lg:mb-6">
        <Link
          href="/dashboardfoothub/statistiques"
          className="text-sm md:text-base lg:text-lg hover:underline font-semibold tracking-tight transition-all"
        >
          Stats club →
        </Link>
      </div>

      {/* Grid de stats avec flex-wrap */}
      <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-5">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex-1 min-w-[calc(100%-0px)] sm:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(33.333%-1rem)] border border-gray-200/60 dark:border-gray-700/50 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 md:gap-4">
                {/* Icône */}
                <div className="flex-shrink-0">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-gray-700 dark:text-gray-300" />
                </div>

                {/* Label + Valeur */}
                <div className="flex flex-col">
                  <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium tracking-tight">
                    {stat.label}
                  </p>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatsPrincipal;
