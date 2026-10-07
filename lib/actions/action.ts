import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { AppError } from "@/lib/errors";

export type ActionResult<T = undefined> =
  | { success: true; message: string; data: T }
  | { success: false; message: string };

type HandlerResult<T> = { message: string; data?: T };

/**
 * Builds a server action: validates the input with zod, runs the handler and
 * always resolves to an `ActionResult` (never throws to the client).
 *
 * // features/events/actions/delete-event.ts
 * "use server";
 * export const deleteEvent = action(z.string(), async (eventId) => {
 *   const { membership } = await requireCoach();
 *   ...
 *   return { message: "Événement supprimé" };
 * });
 */
export function action<S extends z.ZodType, T = undefined>(
  schema: S,
  handler: (input: z.output<S>) => Promise<HandlerResult<T>>,
) {
  return async (input: z.input<S>): Promise<ActionResult<T>> => {
    try {
      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0]?.message ?? "Données invalides" };
      }
      const { message, data } = await handler(parsed.data);
      return { success: true, message, data: data as T };
    } catch (error) {
      unstable_rethrow(error); // let redirect() / notFound() through
      if (error instanceof AppError) return { success: false, message: error.message };
      console.error("[action]", error);
      return { success: false, message: "Une erreur est survenue" };
    }
  };
}
