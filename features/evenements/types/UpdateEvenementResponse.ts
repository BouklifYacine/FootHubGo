import { EvenementDetail } from "./EvenementsTypes";


export interface UpdateEvenementSuccessResponse {
  success: true;
  message: string;
  evenement: EvenementDetail;
}

export interface UpdateEvenementErrorResponse {
  success: false;
  message: string;
  details?: Record<string, unknown>;
  error?: string;
}

export type UpdateEvenementResponse = UpdateEvenementSuccessResponse | UpdateEvenementErrorResponse; 


