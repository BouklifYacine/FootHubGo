"use client";

import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/actions/action";

type Options<TInput, TData> = {
  /** Query keys to invalidate once the action settles. */
  invalidate?: QueryKey[];
  /** Optimistic update of one cached query (rolled back on error). */
  optimistic?: {
    queryKey: QueryKey;
    update: (previous: unknown, input: TInput) => unknown;
  };
  onSuccess?: (data: TData, input: TInput) => void;
  /** Show the action message in a toast (default: true). "errors": only failures (silent success). */
  toast?: boolean | "errors";
};

/**
 * The one way to call a server action from a component:
 * success/error toasts, cache invalidation and optional optimistic update.
 *
 * const deleteEvent = useActionMutation(deleteEventAction, { invalidate: [queryKeys.events.all] });
 * deleteEvent.mutate(event.id);
 */
export function useActionMutation<TInput, TData>(
  action: (input: TInput) => Promise<ActionResult<TData>>,
  { invalidate = [], optimistic, onSuccess, toast: showToast = true }: Options<TInput, TData> = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      const result = await action(input);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onMutate: async (input) => {
      if (!optimistic) return undefined;
      await queryClient.cancelQueries({ queryKey: optimistic.queryKey });
      const previous = queryClient.getQueryData(optimistic.queryKey);
      queryClient.setQueryData(optimistic.queryKey, (old: unknown) => optimistic.update(old, input));
      return { previous };
    },
    onError: (error, _input, context) => {
      if (optimistic && context) queryClient.setQueryData(optimistic.queryKey, context.previous);
      if (showToast) toast.error(error.message || "Une erreur est survenue");
    },
    onSuccess: (result, input) => {
      if (showToast === true) toast.success(result.message);
      onSuccess?.(result.data, input);
    },
    onSettled: () =>
      Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}
