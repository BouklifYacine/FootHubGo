import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { GlowEffect } from "@/components/ui/glow-effect";

const avatars = [
  {
    imageUrl:
      "https://sportal.fr/wp-content/uploads/2024/09/pep-guardiola_12890091190x786.jpg",
    profileUrl: "https://github.com/dillionverma",
    id: 1,
  },
  {
    imageUrl:
      "https://icdn.empireofthekop.com/wp-content/uploads/2023/08/fbl-sin-eng-bayern-presser-2.jpg",
    profileUrl: "https://github.com/tomonarifeehan",
    id: 2,
  },
  {
    imageUrl:
      "https://i.eurosport.com/2024/01/07/3857005-78373028-2560-1440.jpg",
    profileUrl: "https://github.com/BankkRoll",
    id: 3,
  },
  {
    imageUrl:
      "https://cdn.vox-cdn.com/thumbor/r0U59Lx7DOSI2Z_F7WLnzcbQfuU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/24953495/1698708349.jpg",
    profileUrl: "https://github.com/safethecode",
    id: 4,
  },
  {
    imageUrl:
      "https://yop.l-frii.com/wp-content/uploads/2024/08/Ancelotti-est-lun-des-meilleurs-entraineurs-de-tous-les-temps.jpg",
    profileUrl: "https://github.com/sanjay-mali",
    id: 5,
  },
  {
    imageUrl:
      "https://assets.goal.com/images/v3/bltcf27e487fb22060c/GOAL%20-%20Blank%20WEB%20-%20Facebook(768).jpeg?auto=webp&format=pjpg&width=3840&quality=60",
    profileUrl: "https://github.com/tomonarifeehan",
    id: 6,
  },
];

export function Hero() {
  return (
    <section>
      <div className="mx-auto pt-20 h-full">
        <div className="flex flex-col justify-center items-center gap-6 py-2">
          <div className="flex justify-center items-center pb-2">
            <VersionBadge />
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-6xl xl:text-8xl font-bold tracking-tighter  text-center px-4 max-w-8xl">
            Gérez votre club de {" "}
            <span className="bg-linear-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text inline-block">
              football
            </span>{" "}
             <br className="hidden md:block" />
            en quelques{" "}
            <span className="bg-linear-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text inline-block">
              clics
            </span>
          </h1>

          <p className="max-w-2xl text-base md:text-lg lg:text-xl text-center px-4  pt-3">
           Arrêtez de perdre 3 heures chaque semaine à relancer les joueurs <br></br> Votre club mérite mieux.
          </p>

          <div className="flex justify-center items-center pb-2 pt-3">
            <Link href="/sign-up" className="relative inline-block">
              <GlowEffect
                colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                mode="colorShift"
                blur="soft"
                duration={3}
                scale={0.9}
              />
              <span className="relative inline-flex items-center gap-2 rounded-3xl bg-zinc-950 px-4 py-2 text-base text-zinc-50 outline outline-[#fff2f21f] transition-all duration-200 hover:scale-105 hover:bg-zinc-900 md:px-8 md:py-4 md:text-xl">
                Créer mon club
                <ArrowRight className="size-4 md:size-6" />
              </span>
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center md:flex-row gap-3">
            <AvatarCircles numPeople={100} avatarUrls={avatars} />
            <span className="text-base md:text-lg ">
              Approuvé par +100 coachs
            </span>
          </div>

          <div className="flex pb-8 space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="size-6 fill-yellow-500 text-yellow-500" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function VersionBadge() {
  return (
    <div className="z-10 flex min-h-32 items-center justify-center">
      <div className="group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800">
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <span>FootHubGo version 0.2</span>
          <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
    </div>
  );
}
