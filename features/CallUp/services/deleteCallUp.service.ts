import axios from 'axios';
import { CallUpResponse } from '../interfaces/CallUpInterface';

export const deleteCallUpService = {
  DeleteCallUp: async (callUpId: string): Promise<CallUpResponse> => {
    const { data } = await axios.delete<CallUpResponse>(`/api/convocations/${callUpId}`
    );
    return data;
  },
};
