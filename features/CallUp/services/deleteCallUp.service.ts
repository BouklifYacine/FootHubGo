import ky from 'ky';
import { CallUpResponse } from '../interfaces/CallUpInterface';

export const deleteCallUpService = {
  DeleteCallUp: async (callUpId: string): Promise<CallUpResponse> => {
    return ky.delete(`/api/convocations/${callUpId}`).json<CallUpResponse>();
  },
};
