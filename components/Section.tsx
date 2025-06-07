import React from "react";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { IoStarSharp } from "react-icons/io5";
import { HandWrittenTitle } from "./ui/hand-writing-text";
import { GlowEffectButton } from "./Boutons/BoutonGlowCTA";
import Link from "next/link";

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

const Section = () => {
  return (
    <section>
      <div className="mx-auto pt-20 h-full">
        <HandWrittenTitle title="DevGogogo" subtitle="" />
        <div className="flex flex-col justify-center items-center gap-6 py-2">
          <div className="flex justify-center items-center pb-2">
        
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-9xl font-bold tracking-tighter  text-center px-4 max-w-8xl">
            Créer votre{" "}
            <span className="bg-linear-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text inline-block">
              projet
            </span>{" "}
            à <br className="hidden md:block" />
            une vitesse{" "}
            <span className="bg-linear-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text inline-block">
              éclair
            </span>
          </h1>

          <p className="max-w-2xl text-base md:text-lg lg:text-xl text-center px-4  pt-3">
            Grace à notre boilerplate gagnez plus de 80% de temps de
            configuration redondante pour des projets full-stack en NextJS.
          </p>

          <div className="flex justify-center items-center pb-2 pt-3">
            <Link href={"/connexion"}>
           
              <GlowEffectButton texte="Rejoindre"></GlowEffectButton>
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center md:flex-row gap-3">
            <AvatarCircles numPeople={100} avatarUrls={avatars} />
            <span className="text-base md:text-lg ">
              Approuvé par +100 utilisateurs
            </span>
          </div>

          <div className="flex pb-8 space-x-1">
            <IoStarSharp className="text-yellow-500 text-2xl" />
            <IoStarSharp className="text-yellow-500 text-2xl" />
            <IoStarSharp className="text-yellow-500 text-2xl" />
            <IoStarSharp className="text-yellow-500 text-2xl" />
            <IoStarSharp className="text-yellow-500 text-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section;
