import {
  CoachApplicationsApi,
  JoinClubPayload,
  JoinClubResponse,
  RequestToJoinClubApi,
  ReviewDecision,
} from "../types/GetRequestToJoinClubTypes";
import ky from "ky";

export const GetRequestToJoinClubListService = {
  ApiCall: async (): Promise<RequestToJoinClubApi> => {
    const response = await fetch("/api/requesttojoinclub/user");
    const data: RequestToJoinClubApi = await response.json();
    return data;
  },
};

export const JoinClubService = {
  sendRequest: async (
    teamId: string,
    data: JoinClubPayload
  ): Promise<JoinClubResponse> => {
    return await ky
      .post(`/api/requesttojoinclub/team/${teamId}`, {
        json: data,
      })
      .json();
  },
};

export const DeleteRequestToJoinClubService = {
  deleteRequest: async (
    teamId: string,
    requestId: string
  ): Promise<JoinClubResponse> => {
    return await ky
      .delete(`/api/requesttojoinclub/team/${teamId}/request/${requestId}`)
      .json();
  },
};

export const UpdateRequestToJoinClubService = {
  patchRequest: async (
    teamId: string,
    requestId: string,
    data: JoinClubPayload
  ): Promise<JoinClubResponse> => {
    return await ky
      .patch(`/api/requesttojoinclub/team/${teamId}/request/${requestId}`, {
        json: data,
      })
      .json();
  },
};

// Coach services
export const GetTeamApplicationsService = {
  getApplications: async (teamId: string): Promise<CoachApplicationsApi> => {
    return await ky.get(`/api/requesttojoinclub/team/${teamId}`).json();
  },
};

export const ReviewApplicationService = {
  review: async (
    teamId: string,
    requestId: string,
    decision: ReviewDecision
  ): Promise<JoinClubResponse> => {
    return await ky
      .patch(
        `/api/requesttojoinclub/team/${teamId}/request/${requestId}/review`,
        {
          json: { decision },
        }
      )
      .json();
  },
};
