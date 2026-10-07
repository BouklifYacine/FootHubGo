"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { closePoll, createPoll, deletePoll, vote } from "../actions";
import type { Poll } from "../types";

const invalidate = [queryKeys.polls.all];

export function usePolls() {
  return useQuery({
    queryKey: queryKeys.polls.all,
    queryFn: () => fetchJson<Poll[]>("/api/polls"),
    // Votes of the teammates show up without reloading the page
    refetchInterval: 30_000,
  });
}

export const useCreatePoll = (onSuccess?: () => void) => useActionMutation(createPoll, { invalidate, onSuccess });

export const useVote = () =>
  useActionMutation(vote, {
    invalidate,
    toast: "errors",
    optimistic: {
      queryKey: queryKeys.polls.all,
      update: (old, { pollId, choices }) =>
        (old as Poll[] | undefined)?.map((poll) => (poll.id === pollId ? { ...poll, myChoices: choices } : poll)),
    },
  });

export const useClosePoll = () => useActionMutation(closePoll, { invalidate });

export const useDeletePoll = () => useActionMutation(deletePoll, { invalidate });
