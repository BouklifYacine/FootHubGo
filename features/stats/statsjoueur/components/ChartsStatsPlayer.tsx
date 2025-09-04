"use client";
import {
  Radar,RadarChart,PolarGrid,PolarAngleAxis,PolarRadiusAxis,ResponsiveContainer,Tooltip } from "recharts";
import { StatistiqueJoueur } from "../interface-types/interfacetype";

  interface Props {
      statsJoueurData: StatistiqueJoueur | undefined
  }

function ChartsStatsPlayer({ statsJoueurData }: Props) {
        const stats = statsJoueurData?.statsjoueur

        console.log(stats)
  const data = [
    {
      subject: "Buts/Match",
      A: stats?.Buts90
    },
    {
      subject: "Passe dé/Match",
      A: 98,
      B: 130,
      fullMark: 150,
    },
    {
      subject: "English",
      A: 86,
      B: 130,
      fullMark: 150,
    },
    {
      subject: "Geography",
      A: 99,
      B: 100,
      fullMark: 150,
    },
    {
      subject: "Physics",
      A: 85,
      B: 90,
      fullMark: 150,
    },
    
  ];
  return (
    <div className="flex items-center justify-center ">
      <ResponsiveContainer width={500} height={500} >
        <RadarChart  cx="50%" cy="50%" outerRadius="80%" data={data} >
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis  domain={[0, 10]} 
  />
      <Tooltip 
  isAnimationActive={true} 
  offset={8} 
  wrapperStyle={{ backgroundColor: '#333', borderRadius: 20, color: '#fff' }}
  contentStyle={{ backgroundColor: '#444', borderRadius: 20, padding: '10px' }}
  separator=" : "
/>
          <Radar
            name="Mike"
            dataKey="A"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.7}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartsStatsPlayer;
