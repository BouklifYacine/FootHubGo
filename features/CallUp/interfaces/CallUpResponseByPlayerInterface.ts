import { $Enums } from "@/generated/prisma/browser";

export interface CallUpResponseByPlayerServiceApi {
  message: string;
  convocation: {
    id: string;
    statut: $Enums.StatutConvocation;
    dateReponse: Date | null;
  };
}

export interface CallUpResponseParams {
  callUpId: string;
  statut: "CONFIRME" | "REFUSE";
}