"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useRouter } from "next/navigation";
import { useRejoindreEquipe } from "@/features/rejoindreclub/hook/useRejoindreEquipe";
import { RejoindreEquipeSchema } from "@/features/rejoindreclub/schema/schemaRejoindreEquipe";


type FormData = z.infer<typeof RejoindreEquipeSchema>;

interface Props {
  texte: string;
  placeholder: string;
}

export function InputBouton({ texte, placeholder }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(RejoindreEquipeSchema),
  });

  const mutation = useRejoindreEquipe();

  const onSubmit = async (data: FormData) => {
    const result = await mutation.mutateAsync(data);
    if (result.success) {
      reset();
      router.push("/dashboardfoothub/effectif");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-sm"
    >
      <div className="flex items-center gap-2">
        <Input
          type="text"
          className="placeholder:opacity-40"
          placeholder={placeholder}
          {...register("codeInvitation")}
          disabled={isSubmitting || mutation.isPending}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={isSubmitting || mutation.isPending}
        >
          {texte}
          <Send className="ml-1" />
        </Button>
      </div>
      {/* Message d'erreur sous la ligne input/bouton */}
      <div className="min-h-[20px] mt-1">
        {errors.codeInvitation && (
          <p className="text-xs text-red-500">
            {errors.codeInvitation.message}
          </p>
        )}
      </div>
    </form>
  );
}