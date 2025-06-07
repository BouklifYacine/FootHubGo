import { redirect } from "next/navigation";
import { BarreLaterale } from "../../../features/parametres/components/BarreLatérale";

import Header from "@/components/header";
import { headers } from "next/headers";
import { auth } from "@/auth";


export default async function PageParametres({params}: {params: Promise<{ id: string }>}) {
   const session = await auth.api.getSession({
         headers: await headers()
     })
  const { id } = await params;

  if (!session?.user) {
    redirect("/connexion");
  }

  if (session.user.id !== id) {
    redirect(`/parametres/${session.user.id}`);
  }

  // console.log(session)

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Paramètres</h1>
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          <BarreLaterale userId={id} />
        </div>
      </div>
    </>
  );
}
