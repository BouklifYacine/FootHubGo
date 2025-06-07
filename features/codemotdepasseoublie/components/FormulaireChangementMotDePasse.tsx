"use client";

import React, { useState } from "react";
import { Lock, Mail, MessageSquareLock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ResetPasswordSchema } from "@/features/codemotdepasseoublie/schemas/SchemaMotDepasse";
import { InputPassword } from "@/features/parametres/components/InputPassword";

type Schema = z.infer<typeof ResetPasswordSchema>;

const FormulaireChangementMotDePasse = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const router = useRouter();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data: Schema) => {
    try {
      const response = await axios.post(
        "/api/motdepasseoublie/confirmation",
        data
      );

      reset();
      setCode(response.data.message);
      setErrorMessage("");
      router.push("/connexion");
    } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.message || "Une erreur est survenue"
      );
    } else {
      console.error("Erreur inconnue:", error);
      setErrorMessage("Une erreur est survenue");
    }
  }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl text-black font-bold text-center mb-6">
          Nouveau mot de passe
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                {...register("email")}
                type="email"
                className="w-full pl-10 pr-3 py-2 rounded-md border text-black border-gray-300 "
                placeholder="Rentrez votre email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Code
            </label>
            <div className="relative">
              <MessageSquareLock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                {...register("code")}
                type="number"
                className="w-full pl-10 pr-3 py-2 text-black rounded-md border border-gray-300 "
                placeholder="Code"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.code?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
                <InputPassword
               {...register("newPassword")}
              />
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

        

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          <p className=" text-green-500 text-sm">{code}</p>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white cursor-pointer py-2 rounded-md hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "En cours" : "Valider "}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormulaireChangementMotDePasse;