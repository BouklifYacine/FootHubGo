import ky from "ky";
import type {
  ClubMembersResponse,
  BlockStatusResponse,
  BlockUserInput,
} from "../types";

const api = ky.create({
  prefixUrl: "/api",
});

export const MemberService = {
  // Club members
  getClubMembers: (): Promise<ClubMembersResponse> =>
    api.get("chat/members").json<ClubMembersResponse>(),

  // Group members
  addToGroup: (conversationId: string, memberIds: string[]) =>
    api
      .post(`chat/conversations/${conversationId}/members`, {
        json: { memberIds },
      })
      .json(),

  removeFromGroup: (conversationId: string, userId: string) =>
    api
      .delete(`chat/conversations/${conversationId}/members?userId=${userId}`)
      .json(),

  // Blocking
  block: (data: BlockUserInput) =>
    api.post("users/block", { json: data }).json(),

  getBlockStatus: (targetId: string): Promise<BlockStatusResponse> =>
    api.get(`users/block?targetId=${targetId}`).json<BlockStatusResponse>(),
};
