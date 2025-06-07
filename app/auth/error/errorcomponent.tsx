"use client"
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
  
    const getErrorMessage = (errorCode: string | null) => {
      if (errorCode === "EmailExists") {
        return "Un compte avec cet email existe déjà. Utilisez un autre email ou connectez-vous avec vos identifiants unique.";
      } else if (errorCode === "NameExists") {
        return "Un compte avec ce pseudo existe déjà. Utilisez un autre pseudo ou connectez-vous avec vos identifiants unique.";
      } else {
        return "Une erreur est survenue lors de la connexion.";
      }
    };
  
    return (
      <>
        <p className="text-gray-700 mb-4">
          {getErrorMessage(error)}
        </p>
        <Link
          href="/connexion"
          className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retour à la connexion
        </Link>
      </>
    );
  }