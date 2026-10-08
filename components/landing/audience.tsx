import { ClipboardList, Smartphone, Users } from "lucide-react";

const highlights = [
  {
    Icon: ClipboardList,
    title: "Pour le coach",
    text: "Planifiez entraînements et matchs, convoquez en un clic et voyez qui sera là sans relancer tout le monde.",
  },
  {
    Icon: Users,
    title: "Pour les joueurs",
    text: "Répondez aux convocations, indiquez vos présences, suivez vos statistiques et discutez avec l'équipe.",
  },
  {
    Icon: Smartphone,
    title: "Sans installation",
    text: "Tout se passe dans le navigateur, sur téléphone comme sur ordinateur. Un code d'invitation suffit pour rejoindre le club.",
  },
];

/** Who the app is for (neutral content: no club logos, no testimonials). */
export function Audience() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <h2 className="mx-auto max-w-3xl text-center text-2xl font-bold text-pretty lg:text-4xl">
          Pensé pour le football amateur
        </h2>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:mt-16 md:grid-cols-3">
          {highlights.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border p-6 shadow-sm">
              <Icon className="size-8 text-purple-500" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
