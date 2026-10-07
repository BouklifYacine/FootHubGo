import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import { requireUserWithClub } from "@/app/(middleware)/requireUserWithClub";
import { SquadView } from "@/features/team/components/squad-view";

export default async function SquadPage() {
  await MiddlewareUtilisateurNonConnecte();
  await requireUserWithClub();

  return <SquadView />;
}
