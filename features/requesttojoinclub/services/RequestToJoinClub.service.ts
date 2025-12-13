import { JoinClubPayload, JoinClubResponse, RequestToJoinClubApi } from "../types/GetRequestToJoinClubTypes";
import ky from "ky";


export const GetRequestToJoinClubListService = {
  ApiCall: async (): Promise<RequestToJoinClubApi> => {
    const response = await fetch("/api/requesttojoinclub/user");
    const data: RequestToJoinClubApi = await response.json();
    return data;
  },
};

export const JoinClubService = {
  sendRequest: async (teamId: string, data: JoinClubPayload): Promise<JoinClubResponse> => {
    return await ky.post(`/api/requesttojoinclub/team/${teamId}`, {
      json: data, 
    }).json();
  },
};

export const DeleteRequestToJoinClubService = {
  deleteRequest : async (teamId: string, requestId : string): Promise<JoinClubResponse> => {
    return await ky.delete(`/api/requesttojoinclub/team/${teamId}/request/${requestId}` ).json()
  }
}