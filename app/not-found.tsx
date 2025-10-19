import Link from "next/link";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="bg-muted flex min-h-[80vh] flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-md flex-col gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <h1 className="text-4xl font-bold">404</h1>
            <h2 className="text-2xl font-semibold">Page non trouvée</h2>
          </div>
          
          <p className="text-muted-foreground">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          
          <div className="flex justify-center pt-4">
            <Button asChild>
              <Link href="/">
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}