import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { GlowEffect } from "@/components/ui/glow-effect";

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

          <div className="flex flex-col items-center justify-center gap-3 pb-2 pt-3 sm:flex-row">
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
            {/* Players invited by their coach: the code (or the invite link) brings them to their team. */}
            <Link
              href="/join"
              className="inline-flex min-h-11 items-center gap-2 rounded-3xl border px-4 py-2 text-base font-medium transition-colors hover:bg-accent md:px-8 md:py-4 md:text-xl"
            >
              J&apos;ai un code d&apos;invitation
            </Link>
          </div>

          <ul className="flex flex-col items-center gap-2 pb-8 text-base md:flex-row md:gap-6 md:text-lg">
            {["Sans installation", "Sur mobile et ordinateur", "Rappels automatiques"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-5 text-green-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
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
          <span>FootHubGo 1.0</span>
          <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
    </div>
  );
}
