
import { auth } from '@/auth';
import ClientSidePayment from './ClientPayement'
import { headers } from 'next/headers';

const abonnements = [
  {
    nom: "Mensuel",
    prix: "5€",
    prixMensuel: null,
    reduction: null,
    description: "Pour les utilisateurs réguliers",
    tag: "Populaire",
    avantages: [
      "Toutes les fonctionnalités gratuites",
      "Support prioritaire par email",
      "Fonctionnalités avancées",
      "Mises à jour régulières",
    ],
    lienStripe: process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY_PRICE_ID || ""
  },
  {
    nom: "Annuel",
    prix: "50€",
    prixMensuel: "4.17€",
    reduction: "17%",
    description: "Pour les utilisateurs engagés",
    tag: "Meilleure offre",
    avantages: [
      "Toutes les fonctionnalités mensuelles",
      "Support prioritaire 24/7",
      "Accès anticipé aux nouvelles fonctionnalités",
      "Formation personnalisée",
 
    ],
    lienStripe: process.env.NEXT_PUBLIC_STRIPE_LINK_YEARLY_PRICE_ID || ""
  },
]

const SectionPayement = async () => {
const session = await auth.api.getSession({
    headers: await headers() 
});


  return (
    <div className="min-h-screen  py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className=" text-center mb-16 text-3xl md:text-5xl font-bold tracking-tight">
          Passez au Next Level
        </h2>
        <div className="flex justify-center w-full">
          <div className="w-full max-w-6xl">
            <ClientSidePayment session={session?.user.id || ""} abonnements={abonnements} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionPayement