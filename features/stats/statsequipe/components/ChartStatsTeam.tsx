"use client";
import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { StatistiqueEquipeID } from "../interface/InterfaceStatsEquipe";

interface Props {
  StatsEquipeData: StatistiqueEquipeID | undefined;
}

function ChartsStatsTeam({ StatsEquipeData }: Props) {
  if (!StatsEquipeData) {
    return (
      <div className="flex items-center justify-center h-64">
        Aucune donnée statistique disponible
      </div>
    );
  }

  const stats = StatsEquipeData.statsequipe;

  const normalizePercent = (value: number) => Math.min(value / 100, 1);
  const normalizeRatio = (value: number, max: number) => Math.min(value / max, 1);
  const normalizeInverse = (value: number, max: number) => {
    const inverted = max - value;
    return inverted < 0 ? 0 : inverted / max;
  };

  const data = [
    {
      subject: "Taux Victoires",
      value: normalizePercent(stats.tauxVictoire),
      fullValue: `${stats.tauxVictoire.toFixed(1)}%`,
    },
    {
      subject: "Moyenne Points Extérieur / Match",
      value: normalizeRatio(stats.moyennePointsExterieur, 3),
      fullValue: `${stats.moyennePointsExterieur.toFixed(2)} pts (max 3)`,
    },
    {
      subject: "Buts par Match",
      value: normalizeRatio(stats.moyenneButsMarquesParMatch, 5),
      fullValue: stats.moyenneButsMarquesParMatch.toFixed(2),
    },
    {
      subject: "Clean Sheets",
      value: normalizePercent(stats.tauxCleanSheet),
      fullValue: `${stats.tauxCleanSheet.toFixed(1)}%`,
    },
    {
      subject: "Moyenne Buts Encaissés",
      value: normalizeInverse(stats.moyenneButsEncaissesParMatch, 3.5), // max 5 buts encaissés en moyenne pour l’échelle
      fullValue: stats.moyenneButsEncaissesParMatch.toFixed(2),
    },
    {
      subject: "Moyenne Points domicile / Match",
      value: normalizeRatio(stats.moyennePointsDomicile, 3),
      fullValue: `${stats.moyennePointsDomicile.toFixed(2)} pts (max 3)`,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="md:text-3xl text-xl font-semibold mb-4">Statistiques de l'équipe</h2>

      <ResponsiveContainer width={500} height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 14, fill: "#374151" }} />
          <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "#6B7280" }} tickCount={6} />
          <Tooltip
            formatter={(value, name, props) => [`${props.payload.fullValue}`, name]}
            contentStyle={{
              backgroundColor: "#1F2937",
              borderRadius: 8,
              border: "none",
              color: "#F9FAFB",
              fontSize: "14px",
            }}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#2563EB"
            fill="#2563EB"
            fillOpacity={0.6}
            strokeWidth={3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartsStatsTeam;
