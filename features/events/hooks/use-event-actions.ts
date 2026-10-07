"use client";

import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { createEvent, deleteEvent, moveEvent, updateEvent } from "../actions";

// Events also feed the home page (next events), so both are refreshed.
const invalidate = [queryKeys.events.all, queryKeys.home];

export const useCreateEvent = (onSuccess?: () => void) =>
  useActionMutation(createEvent, { invalidate, onSuccess });

export const useUpdateEvent = (onSuccess?: () => void) =>
  useActionMutation(updateEvent, { invalidate, onSuccess });

export const useMoveEvent = () => useActionMutation(moveEvent, { invalidate });

export const useDeleteEvent = (onSuccess?: () => void) =>
  useActionMutation(deleteEvent, { invalidate, onSuccess });
