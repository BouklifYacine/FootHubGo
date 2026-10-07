import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { teamLevelLabels } from "@/lib/enum-labels";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import type { HomeData } from "../types";

export function TeamCard({ team }: { team: HomeData["team"] }) {
  return (
    <div className="m-2">
      <div className="flex justify-between p-4">
        <p className="text-md font-light tracking-tighter md:text-lg">Infos Club</p>
        <Link href="/app/squad" className="text-md font-bold tracking-tighter hover:underline md:text-lg">
          Effectif complet
        </Link>
      </div>

      <div className="mb-8 flex flex-col items-center gap-2">
        <InitialsAvatar name={team.name} src={team.logoUrl} className="size-[100px] text-2xl md:size-[140px]" />
        <Badge className="rounded-xl px-3 text-xs font-medium tracking-tighter md:text-sm">{team.name}</Badge>
        <p className="text-sm text-muted-foreground">{teamLevelLabels[team.level]}</p>

        <div className="mt-4 flex gap-10">
          <Counter value={team.memberCount} label="Membres" />
          {team.inviteCode && <Counter value={team.inviteCode} label="Code d'invitation" />}
        </div>
      </div>
    </div>
  );
}

function Counter({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xl font-bold md:text-3xl">{value}</p>
      <p className="text-sm tracking-tighter md:text-lg">{label}</p>
    </div>
  );
}
