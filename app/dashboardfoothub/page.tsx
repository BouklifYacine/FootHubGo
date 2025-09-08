import ComposantPrincipalAccueil from "@/features/accueil/components/ComposantPrincipalAccueil";
import { MiddlewareUtilisateurNonConnecte } from "../(middleware)/MiddlewareUtilisateurNonConnecte";

export default async function Dashboardfoothub() {
  await MiddlewareUtilisateurNonConnecte();

  return (
   <div>
    <ComposantPrincipalAccueil></ComposantPrincipalAccueil>
   </div>
  );
}
