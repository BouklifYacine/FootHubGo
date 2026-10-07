import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    question: "Comment commencer avec FootHubGo ?",
    answer:
      "Créez un compte, puis créez votre club : vous devenez automatiquement entraîneur. Partagez ensuite le code d'invitation à 6 chiffres à vos joueurs pour qu'ils rejoignent l'équipe.",
  },
  {
    question: "Quelles fonctionnalités sont disponibles ?",
    answer:
      "Calendrier des entraînements et matchs, convocations et présences, statistiques joueurs et équipe, suivi des blessures, chat d'équipe en temps réel et notifications.",
  },
  {
    question: "Mes joueurs doivent-ils installer une application ?",
    answer:
      "Non, FootHubGo fonctionne directement dans le navigateur, sur ordinateur comme sur mobile.",
  },
  {
    question: "De nouvelles fonctionnalités sont-elles prévues ?",
    answer:
      "Oui : gestion multi-équipes, cotisations en ligne, comptes parents pour les catégories jeunes et compositions tactiques sont au programme.",
  },
];

export function Faq() {
  return (
    <div className="pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="py-8 text-center text-4xl md:text-6xl font-bold tracking-wide bg-linear-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            FAQ
          </h2>

          <div className="space-y-6">
            {questions.map(({ question, answer }, index) => (
              <div
                key={question}
                className="backdrop-blur-xs rounded-3xl md:rounded-2xl p-4 dark:shadow-blue-500 shadow-md shadow-blue-500"
              >
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={`item-${index}`} className="border-b-0">
                    <AccordionTrigger className="text-lg md:text-xl p-1 md:p-2">
                      {question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base px-1 md:px-2">
                      {answer}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
