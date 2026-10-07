import type Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch {
    return NextResponse.json({ message: "Signature invalide" }, { status: 400 });
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
    // 500 => Stripe retries the event later.
    console.error(`[stripe] ${event.type}`, error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
