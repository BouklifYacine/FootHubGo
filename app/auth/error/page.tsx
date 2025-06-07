
import { Suspense } from "react";
import { ErrorContent } from "./errorcomponent";

export const dynamic = 'force-dynamic'; 

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Erreur de connexion
        </h1>
        <Suspense fallback={<p>Chargement du message erreur...</p>}>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}


