import { queryKeys } from "@/lib/query/keys";

/** Everything that shows a call-up or an attendance: home, agenda / event page, badges. */
export const participationInvalidation = [queryKeys.home, queryKeys.events.all, queryKeys.me.callUps, queryKeys.me.badges];
