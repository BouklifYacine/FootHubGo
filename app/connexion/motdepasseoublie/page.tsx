"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { EmailSchema } from "@/features/codemotdepasseoublie/schemas/SchemaMotDepasse";

type Schema = z.infer<typeof EmailSchema>;

const AuthForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({
    resolver: zodResolver(EmailSchema),
  });

  const router = useRouter();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data: Schema) => {
  try {
    console.log("Données envoyées:", data);
    const response = await axios.post("/api/motdepasseoublie", data);
    console.log("Réponse API:", response);

    reset();
    setCode(response.data.message);
    setErrorMessage("");
    router.push("/connexion/motdepasseoublie/code");
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
        <h2 className="text-2xl font-bold text-center text-black mb-6">
          Mot de passe oublié ?
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
                className="w-full pl-10 text-black pr-3 py-2 rounded-md border border-gray-300 focus:ring-2  focus:border-transparent"
                placeholder="Rentrez votre email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          <p className=" text-green-500 text-sm">{code}</p>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "En cours" : "Valider "}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;