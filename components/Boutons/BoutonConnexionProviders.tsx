"use client";
import Image from "next/image";
import Github from "@/public/github-icon-2.svg";
import Google from "@/public/Google.png";
import React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

const BoutonConnexionProviders = () => {
  const GoogleConnexion = async () => {
    const data = await authClient.signIn.social({
      provider: "google",
      callbackURL:'/dashboardfoothub'
    });
    return data;
  };

  const GithubConnexion = async () => {
    const data = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboardfoothub"
    });

    return data;
  };

  return (
    <>
   
        <Button variant="outline" type="button" onClick={GithubConnexion} className="w-full cursor-pointer">
          <Image src={Github} alt="GitHub Logo" width={25} height={25} />
          Connexion avec Github
        </Button>

        <Button variant="outline" type="button" onClick={GoogleConnexion} className="w-full cursor-pointer ">
          <Image src={Google} alt="Google Logo" width={25} height={25} />
           Connexion avec Google 
        </Button>


        
   
    </>
  );
};

export default BoutonConnexionProviders;
