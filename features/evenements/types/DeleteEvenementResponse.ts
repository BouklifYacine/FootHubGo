export interface DeleteEvenementSuccessResponse {
  success: true;
  message: string;
}

export interface DeleteEvenementErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export type DeleteEvenementResponse = DeleteEvenementSuccessResponse | DeleteEvenementErrorResponse; 