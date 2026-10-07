"use client";

import { CheckCheck, History, PhoneOff, TableProperties } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCallUps } from "../hooks/use-my-call-ups";
import { MyCallUpCard } from "./my-call-up-card";

function StatCard({ icon, title, value }: { icon: ReactNode; title: string; value: number }) {
  return (
    <Card className="flex-1">
      <CardContent className="flex items-center gap-3 pt-6">
        <div className="rounded-full bg-muted p-2 [&_svg]:size-5">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/** The player's call-ups page: counters + one card per call-up. */
export function MyCallUps() {
  const { data, isPending, error } = useMyCallUps();

  if (isPending) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  if (error) return <p className="mt-4 text-destructive">{error.message}</p>;

  const { stats, callUps } = data;
  return (
    <div className="mt-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row">
        <StatCard icon={<TableProperties />} title="Convocations" value={stats.total} />
        <StatCard icon={<CheckCheck />} title="Confirmées" value={stats.confirmed} />
        <StatCard icon={<PhoneOff />} title="Refusées" value={stats.declined} />
        <StatCard icon={<History />} title="Passées" value={stats.past} />
      </div>

      {callUps.length === 0 ? (
        <div className="flex max-w-[425px] flex-col items-center rounded-xl border p-8 text-center">
          <h3 className="mb-2 text-xl font-bold">Aucune convocation</h3>
          <p className="text-muted-foreground">Vous n&apos;avez pas encore été convoqué.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {callUps.map((callUp) => (
            <MyCallUpCard key={callUp.id} callUp={callUp} />
          ))}
        </div>
      )}
    </div>
  );
}
