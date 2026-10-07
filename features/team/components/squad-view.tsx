"use client";

import { Loader2 } from "lucide-react";
import { useMyTeam } from "../hooks/use-my-team";
import { JoinTeamDialog } from "./join-team-dialog";
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
      <div className="flex justify-center">
        {/* A member can also join another section of their club with its code. */}
        <JoinTeamDialog label="Rejoindre une autre section" />
      </div>
      <SquadTable data={data} />
    </>
  );
}
