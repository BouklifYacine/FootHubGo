"use client";

import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { SchemaConnexion } from "@/features/connexion/schemas/SchemaConnexion";
import { connexionAction } from "../actions/ConnexionAction";
import BoutonConnexionProviders from "@/components/Boutons/BoutonConnexionProviders";
import { InputPassword } from "../../parametres/components/InputPassword";

type Schema = z.infer<typeof SchemaConnexion>;

const ClientConnexionFormulaire = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({
    resolver: zodResolver(SchemaConnexion),
  });

  const router = useRouter();
  const [erreurIdentifiant, setErreurIdentifiant] = useState("");

  const onSubmit = async (data: Schema) => {
    try {
      const result = await connexionAction(data);
      
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setErreurIdentifiant(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error(error);
      setErreurIdentifiant("Une erreur est survenue lors de la connexion");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            {...register("email")}
            type="email"
            placeholder="votre@email.com"
            className="w-full pl-10 pr-3 py-2 rounded-md border text-black border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-md">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <div className="relative">
         <Lock
                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                     size={20}
                   />
        <InputPassword
               {...register("password")}
              />
        </div>
        {errors.password && (
          <p className="text-red-500 text-md">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-end text-md text-blue-600 hover:text-blue-700 underline">
        <Link href="/connexion/motdepasseoublie">
          Mot de passe oublié?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-blue-600 cursor-pointer text-white py-2 rounded-md hover:bg-blue-700 transition-colors ${
          isSubmitting ? "opacity-50" : ""
        }`}
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
      {erreurIdentifiant && (
        <span className="text-red-500 md:text-md block text-center">
          {erreurIdentifiant}
        </span>
      )}

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Ou continuer avec
          </span>
        </div>
      </div>

      <BoutonConnexionProviders />

      <p className="text-center text-md text-gray-600">
        Pas encore inscrit ?{" "}
        <Link href="/inscription" className="text-blue-600 hover:text-blue-700">
          Inscription
        </Link>
      </p>
    </form>
  );
};

export default ClientConnexionFormulaire;