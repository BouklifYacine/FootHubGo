import { BarChart3, Bell, CalendarDays, ClipboardCheck, MessagesSquare } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    Icon: CalendarDays,
    name: "Calendrier du club",
    description:
      "Entraînements, championnat et coupe dans un calendrier partagé. Glissez-déposez pour reprogrammer.",
    href: "/sign-up",
    cta: "Essayer",
    background: <div />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: ClipboardCheck,
    name: "Convocations & présences",
    description:
      "Convoquez vos joueurs en un clic et suivez les réponses en temps réel.",
    href: "/sign-up",
    cta: "Essayer",
    background: <div />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: BarChart3,
    name: "Statistiques",
    description:
      "Buts, passes décisives, notes, clean sheets : les stats de chaque joueur et de l'équipe.",
    href: "/sign-up",
    cta: "Essayer",
    background: <div />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: MessagesSquare,
    name: "Chat d'équipe",
    description: "Messages privés et groupes, mentions et messages épinglés.",
    href: "/sign-up",
    cta: "Essayer",
    background: <div />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Bell,
    name: "Notifications",
    description: "Soyez notifié dès qu'un joueur répond à votre convocation.",
    href: "/sign-up",
    cta: "Essayer",
    background: <div />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function FeaturesBento() {
  return (
    <BentoGrid className="lg:grid-rows-3 container mx-auto">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}
