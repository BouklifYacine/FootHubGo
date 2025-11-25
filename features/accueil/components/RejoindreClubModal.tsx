"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OTPInput, SlotProps } from "input-otp";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useRouter } from "next/navigation";
import { useRejoindreEquipe } from "@/features/rejoindreclub/hook/useRejoindreEquipe";
import { RejoindreEquipeSchema } from "@/features/rejoindreclub/schema/schemaRejoindreEquipe";
import { useState } from "react";
import { Send } from "lucide-react";

type FormData = z.infer<typeof RejoindreEquipeSchema>;

interface Props {
  texte: string;
}

export function RejoindreClubModal({ texte }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const {
    setValue,
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
      setOtpValue("");
      setOpen(false);
      router.push("/dashboardfoothub/effectif");
    }
  };

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    setValue("codeInvitation", value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {texte}
          <Send className="ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Rejoindre un club</DialogTitle>
            <DialogDescription>
              Entrez le code d'invitation à 6 chiffres pour rejoindre un club.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <OTPInput
              value={otpValue}
              onChange={handleOtpChange}
              containerClassName="flex items-center gap-3 has-disabled:opacity-50"
              maxLength={6}
              disabled={isSubmitting || mutation.isPending}
              render={({ slots }) => (
                <div className="flex gap-2">
                  {slots.map((slot, idx) => (
                    <Slot key={idx} {...slot} />
                  ))}
                </div>
              )}
            />
            <div className="min-h-5">
              {errors.codeInvitation && (
                <p className="text-xs text-red-500">
                  {errors.codeInvitation.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpen(false);
                reset();
                setOtpValue("");
              }}
              disabled={isSubmitting || mutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || mutation.isPending || otpValue.length !== 6
              }
            >
              Rejoindre
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground flex size-9 items-center justify-center rounded-md border font-medium shadow-xs transition-[color,box-shadow]",
        { "border-ring ring-ring/50 z-10 ring-[3px]": props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}
