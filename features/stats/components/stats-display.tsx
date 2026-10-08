"use client";

import type { ReactNode } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { LoadingState } from "@/components/app/loading-state";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";

/** Building blocks shared by the team and player stats pages (design tokens: light and dark). */

type HeaderProps = {
  name: string;
  image: string | null | undefined;
  /** Small line under the picture (e.g. club or coach). */
  caption: { name: string; image: string | null | undefined };
  highlights: { label: string; value: ReactNode }[];
};

export function StatsHeader({ name, image, caption, highlights }: HeaderProps) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center">
      <InitialsAvatar name={name} src={image} className="size-24 text-2xl" />
      <div>
        <p className="text-lg font-semibold">{name}</p>
        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <InitialsAvatar name={caption.name} src={caption.image} className="size-5 text-[9px]" />
          {caption.name}
        </p>
      </div>
      <dl className="grid w-full grid-cols-3 gap-2">
        {highlights.map((item) => (
          <div key={item.label} className="rounded-xl bg-muted/60 p-2">
            <dd className="text-2xl font-semibold tabular-nums">{item.value}</dd>
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** `value` is normalized to 0..1, `label` is what the tooltip shows. */
export type RadarPoint = { subject: string; value: number; label: string };

export const normalize = (value: number, max: number) => Math.max(0, Math.min(value / max, 1));

export function StatsRadar({ title, data }: { title: string; data: RadarPoint[] }) {
  return (
    <section className="rounded-2xl border bg-card p-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="h-72 w-full md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="62%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
            <Tooltip
              formatter={(_value, name, item) => [(item.payload as RadarPoint).label, name]}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
                fontSize: "13px",
              }}
            />
            <Radar name="Performance" dataKey="value" stroke="hsl(var(--info))" fill="hsl(var(--info))" fillOpacity={0.35} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* The values in plain text (the chart alone is not accessible). */}
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {data.map((point) => (
          <li key={point.subject}>
            {point.subject} : <span className="font-medium text-foreground">{point.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type StatItem = { label: string; value: ReactNode };

/** Every number of the season, as label / value rows. */
export function StatList({ columns }: { columns: StatItem[][] }) {
  return (
    <section className="rounded-2xl border bg-card p-4">
      <h2 className="mb-2 font-semibold">En détail</h2>
      <dl className="divide-y">
        {columns.flat().map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 py-2 text-sm">
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="font-semibold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function StatsSkeleton() {
  return <LoadingState variant="cards" rows={3} className="mx-auto max-w-5xl" />;
}
