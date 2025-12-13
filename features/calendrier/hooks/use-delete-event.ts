import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteEventAction } from "../actions/delete-event.action";

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEventAction(id);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
