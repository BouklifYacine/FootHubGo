"use client";

import { Loader2 } from "lucide-react";
import { useMyTeam } from "../hooks/use-my-team";
import { SquadTable } from "./squad-table";
import { TeamHeader } from "./team-header";

export function SquadView() {
  const { data, isPending, error } = useMyTeam();

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    );
  }
  if (error) return <p className="p-5 text-red-500">{error.message}</p>;

  return (
    <>
      <TeamHeader data={data} />
      <SquadTable data={data} />
    </>
  );
}
