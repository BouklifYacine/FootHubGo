"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRejoindreEquipeCodeInvitation } from "../(hooks)/UseDashboardClient";
import Link from "next/link";
import { RejoindreEquipeSchema } from "@/app/(schema)/SchemaEquipe";
import { RoleJoueurEquipetype } from "@/lib/RoleJoueurEquipe";
import { useRouter } from "next/navigation";

type FormValues = {
  codeInvitation: string;
};

interface InputCodeInvitationProps {
  utilisateur: RoleJoueurEquipetype | null;
}

const InputCodeInvitation = ({utilisateur} : InputCodeInvitationProps) => {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(RejoindreEquipeSchema),
    defaultValues: {
      codeInvitation: "",
    },
  });

  const { mutate, isPending } = useRejoindreEquipeCodeInvitation();
  const router = useRouter()

  const onSubmit = (data: FormValues) => {
    mutate(data, {
      onSuccess: (result) => {
        if (result.success && result.equipeId) {
          router.push(`/dashboardclient/equipe/${result.equipeId}`);
          reset();
        }
      },
    });
  };

  if ( !utilisateur || utilisateur.roleEquipe !== "SANSCLUB") {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 p-4 rounded-lg bg-background border shadow-sm">
      <div className="w-full sm:w-auto">
        <span className="text-sm font-medium">
          Rentrez un code pour rejoindre une équipe :
        </span>
      </div>

      <div className="flex-grow">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-wrap gap-2"
        >
          <div className="relative min-w-[150px] flex-grow max-w-xs">
            <Input
              {...register("codeInvitation")}
              placeholder="Code"
              className="w-full"
              disabled={isPending}
              type="text"
              
            />
            {errors.codeInvitation && (
              <p className="text-sm text-red-500 mt-1 ">
                {errors.codeInvitation.message}
              </p>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            type="submit"
            disabled={isPending}
            className="whitespace-nowrap"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              "Rejoindre"
            )}
          </Button>
        </form>
      </div>

      <div className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
        {isPending ? (
          <Button
            variant="default"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Indisponible
          </Button>
        ) : (
          <Link href="/dashboardclient/creationequipe" className="block w-full sm:w-auto">
            <Button variant="default" className="w-full">
              Créer une équipe
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default InputCodeInvitation;
