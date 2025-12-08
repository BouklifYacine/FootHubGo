import { RequestToJoinClubApi } from "../types/GetRequestToJoinClubTypes";

export const GetRequestToJoinClubListService = {
  ApiCall: async (): Promise<RequestToJoinClubApi> => {
    const response = await fetch("/api/requesttojoinclub/user");
    const data: RequestToJoinClubApi = await response.json();
    return data;
  },
};
