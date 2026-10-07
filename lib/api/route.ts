import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

type RouteContext<P> = { params: Promise<P> };

/**
 * Wraps a GET route handler: awaits params, serializes the returned value as JSON
 * and turns thrown errors into a consistent `{ message }` response.
 *
 * export const GET = route<{ id: string }>(async ({ params }) => {
 *   const { membership } = await requireMember();
 *   return getEvent(params.id, membership.teamId);
 * });
 */
export function route<P = Record<string, never>>(
  handler: (ctx: { req: NextRequest; params: P }) => Promise<unknown>,
) {
  return async (req: NextRequest, ctx: RouteContext<P>) => {
    try {
      const result = await handler({ req, params: await ctx.params });
      return result instanceof Response ? result : NextResponse.json(result);
    } catch (error) {
      return errorResponse(error, req.nextUrl.pathname);
    }
  };
}

export function errorResponse(error: unknown, where = "api") {
  if (error instanceof AppError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ message: error.issues[0]?.message ?? "Paramètres invalides" }, { status: 400 });
  }
  console.error(`[${where}]`, error);
  return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
}
