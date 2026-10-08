import type Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getStripe } from "@/lib/stripe";
import { loggableError } from "@/lib/errors";
import {
  handleCheckoutCompleted,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "@/features/billing/server/webhook-handlers";

/** A claim this old without `handledAt`: its delivery died (crash, restart, timeout), a retry takes it over. */
const STALE_CLAIM_MS = 5 * 60_000;

/**
 * Idempotency: the event id is claimed first. "handled": a retried delivery of a finished event (no-op);
 * "busy": another delivery is handling it right now (Stripe retries later).
 */
async function claimEvent(event: Stripe.Event): Promise<"claimed" | "handled" | "busy"> {
  try {
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
    return "claimed";
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
  }
  const { count } = await prisma.stripeEvent.updateMany({
    where: { id: event.id, handledAt: null, processedAt: { lt: new Date(Date.now() - STALE_CLAIM_MS) } },
    data: { processedAt: new Date() },
  });
  if (count === 1) return "claimed";
  const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id }, select: { handledAt: true } });
  return existing?.handledAt ? "handled" : "busy";
}

// Called by Stripe (not by the app): stays a REST route, authenticated by the signature.
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ message: "Signature manquante" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch {
    return NextResponse.json({ message: "Signature invalide" }, { status: 400 });
  }

  const claim = await claimEvent(event);
  if (claim === "handled") return NextResponse.json({ received: true, duplicate: true });
  if (claim === "busy") return NextResponse.json({ message: "Événement en cours de traitement" }, { status: 409 });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;
    }
    await prisma.stripeEvent.update({ where: { id: event.id }, data: { handledAt: new Date() } });
    return NextResponse.json({ received: true });
  } catch (error) {
    // 500 => Stripe retries the event later: release the claim so the retry is handled.
    console.error(`[stripe] ${event.type}`, loggableError(error));
    await prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => undefined);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
