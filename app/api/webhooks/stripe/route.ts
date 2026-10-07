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

  // Idempotency: the event id is claimed first; a retried delivery of a handled event is a no-op.
  try {
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw error;
  }

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
    return NextResponse.json({ received: true });
  } catch (error) {
    // 500 => Stripe retries the event later: release the claim so the retry is handled.
    console.error(`[stripe] ${event.type}`, loggableError(error));
    await prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => undefined);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
