"use client";

import type { ReactNode } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/** Building blocks shared by the team and player stats pages. */

const initials = (name: string) => name.slice(0, 2).toUpperCase();

type HeaderProps = {
  name: string;
  image: string | null | undefined;
  /** Small line under the picture (e.g. club or coach). */
  caption: { name: string; image: string | null | undefined };
  highlights: { label: string; value: ReactNode }[];
};

export function StatsHeader({ name, image, caption, highlights }: HeaderProps) {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative flex flex-col justify-center items-center">
        <Avatar className="size-[170px]">
          <AvatarImage src={image ?? undefined} alt={name} className="object-cover" />
          <AvatarFallback className="text-4xl font-semibold">{initials(name)}</AvatarFallback>
        </Avatar>
        <Badge className="absolute left-1/2 -translate-x-1/2 -bottom-5 w-54 rounded-xl flex flex-col items-center">
          <p className="font-light text-base tracking-tighter">{name}</p>
        </Badge>
      </div>

      <div className="flex gap-2 items-center justify-center mt-6">
        <Avatar className="size-[22px]">
          <AvatarImage src={caption.image ?? undefined} alt={caption.name} />
          <AvatarFallback className="text-[10px]">{initials(caption.name)}</AvatarFallback>
        </Avatar>
        <p className="tracking-tighter">{caption.name}</p>
      </div>

      <div className="flex gap-10 mt-4">
        {highlights.map((item) => (
          <div key={item.label} className="flex flex-col gap-2 items-center">
            <p className="text-3xl font-bold">{item.value}</p>
            <p className="text-md tracking-tighter font-lighter">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** `value` is normalized to 0..1, `label` is what the tooltip shows. */
export type RadarPoint = { subject: string; value: number; label: string };

export const normalize = (value: number, max: number) => Math.max(0, Math.min(value / max, 1));

export function StatsRadar({ title, data }: { title: string; data: RadarPoint[] }) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="md:text-3xl text-xl font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width={500} height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 14, fill: "#374151" }} />
          <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "#6B7280" }} tickCount={6} />
          <Tooltip
            formatter={(_value, name, item) => [(item.payload as RadarPoint).label, name]}
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

export type StatItem = { label: string; value: ReactNode };

/** Columns of "value badge + label" rows. */
export function StatList({ columns }: { columns: StatItem[][] }) {
  return (
    <div className="flex gap-10">
      {columns.map((items, index) => (
        <div key={index} className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex gap-2 items-center">
              <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                {item.value}
              </Badge>
              <p className="tracking-tight">{item.label}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  const bar = "bg-gray-300 rounded";
  return (
    <div className="min-h-screen flex flex-col lg:flex-row justify-evenly gap-4 items-center animate-pulse">
      <div className="flex flex-col items-center gap-6">
        <div className="size-[170px] bg-gray-300 rounded-full" />
        <div className={`w-32 h-4 ${bar}`} />
        <div className="flex gap-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-12 h-8 ${bar}`} />
          ))}
        </div>
      </div>
      <div className="w-[500px] max-w-full h-[400px] bg-gray-300 rounded-lg" />
      <div className="flex gap-10">
        {[0, 1].map((column) => (
          <div key={column} className="flex flex-col gap-4">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="w-12 h-6 bg-gray-300 rounded-sm" />
                <div className={`w-32 h-4 ${bar}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
