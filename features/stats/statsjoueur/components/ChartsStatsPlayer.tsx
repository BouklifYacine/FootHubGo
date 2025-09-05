"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { StatistiqueJoueur } from "../interface-types/interfacetype";
import { authClient } from "@/lib/auth-client";

interface Props {
  statsJoueurData: StatistiqueJoueur | undefined;
}

function ChartsStatsPlayer({ statsJoueurData }: Props) {
  const stats = statsJoueurData?.statsjoueur;

  const { data: session } = authClient.useSession();

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        Aucune donnée statistique disponible
      </div>
    );
  }

  // Normalisation en 0–1
  const normalizeMetric = (value: number, maxExpected: number): number => {
    return Math.min(value / maxExpected, 1);
  };

  const data = [
    {
      subject: "Note Moyenne",
      value: Number((stats.notemoyenne / 10).toFixed(2)), // note/10 → 0–1
      fullValue: stats.notemoyenne,
    },
    {
      subject: "Titularisation",
      value: Number((stats.pourcentageTitulaire / 100).toFixed(2)), // %/100
      fullValue: `${stats.pourcentageTitulaire}%`,
    },
    {
      subject: "GA/90",
      value: Number(normalizeMetric(stats.GA90, 2.0).toFixed(2)),
      fullValue: `${stats.GA90} GA90`,
    },
    {
      subject: "Buts/90",
      value: Number(normalizeMetric(stats.Buts90, 1.5).toFixed(2)),
      fullValue: `${stats.Buts90} Buts90`,
    },
    {
      subject: "PD/90",
      value: Number(normalizeMetric(stats.PasseDecisives90, 1.0).toFixed(2)),
      fullValue: `${stats.PasseDecisives90} PD90`,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="md:text-4xl text-2xl tracking-tighter"> {session?.user.name}</h1>

      <ResponsiveContainer width={500} height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 16, fill: "#374151" }}
          />
          <PolarRadiusAxis
            domain={[0, 1]}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            tickCount={6}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(2)}`]}
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
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.6}
            strokeWidth={3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartsStatsPlayer;
