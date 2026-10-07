"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { z } from "zod";
import ky, { isHTTPError, isKyError } from "ky";
import { useRouter } from "next/navigation";
import { EmailSchema } from "@/features/codemotdepasseoublie/schemas/SchemaMotDepasse";

type Schema = z.infer<typeof EmailSchema>;

const AuthForm = () => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
    } as Schema,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: EmailSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(EmailSchema.parse(value));
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  const onSubmit = async (data: Schema) => {
  try {
    console.log("Données envoyées:", data);
    const response = await ky
      .post("/api/motdepasseoublie", { json: data })
      .json<{ message: string }>();
    console.log("Réponse API:", response);

    form.reset();
    setCode(response.message);
    setErrorMessage("");
    router.push("/connexion/motdepasseoublie/code");
  } catch (error) {
    if (isKyError(error)) {
      const data = isHTTPError(error)
        ? (error.data as { message?: string } | string | undefined)
        : undefined;
      console.error("Ky error:", data || error.message);
      setErrorMessage(
        (typeof data === "object" && data?.message) || "Une erreur est survenue"
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="email">
            {(field) => (
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
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="email"
                    className="w-full pl-10 text-black pr-3 py-2 rounded-md border border-gray-300 focus:ring-2  focus:border-transparent"
                    placeholder="Rentrez votre email"
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            )}
          </form.Field>

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
