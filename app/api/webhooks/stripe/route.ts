import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { Plan, PlanAbonnement } from "@prisma/client";
import { createElement } from "react";
import { sendEmail } from "@/emails/email";
import {
  EmailNouvelAbonnement,
  EmailChangementAbonnement,
  EmailSuppressionAbonnement,
} from "@/emails/AbonnementEmail";

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (error) {
      console.error("Erreur API:", error);
      return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(event);
        break;

      default:
        return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

async function handleSubscriptionCanceled(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  const user = await prisma.user.findUnique({
    where: { clientId: customerId },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé pour le customerId: " + customerId);
  }

  await prisma.abonnement.delete({
    where: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: Plan.free,
      clientId: null,
    },
  });

  if (user.email) {
    const emailElement = createElement(EmailSuppressionAbonnement, {
      name: user.name || user.email,
      plan: "Pro",
    });

    await sendEmail({
      to: user.email,
      subject: "Confirmation de résiliation de votre abonnement",
      emailComponent: emailElement,
    });
  }
}

async function handleCheckoutComplete(event: Stripe.Event) {
  const session = await stripe.checkout.sessions.retrieve(
    (event.data.object as Stripe.Checkout.Session).id,
    { expand: ["line_items"] }
  );

  const email = session.customer_details?.email;
  if (!email) throw new Error("Pas d'email");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Pas d'utilisateur");

  const clientId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!user.clientId && clientId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { clientId },
    });
  }

  const item = session.line_items?.data[0];
  if (item?.price?.type === "recurring") {
    const endDate = new Date();
    const isYearly = item.price.id === process.env.STRIPE_YEARLY_PRICE_ID;
    const periode = isYearly ? PlanAbonnement.année : PlanAbonnement.mois;

    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    await prisma.abonnement.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        datedebut: new Date(),
        datefin: endDate,
        plan: Plan.pro,
        periode: periode,
      },
      update: {
        plan: Plan.pro,
        periode: periode,
        datedebut: new Date(),
        datefin: endDate,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { plan: Plan.pro },
    });

    const emailElement = createElement(EmailNouvelAbonnement, {
      name: user.name || email,
      plan: isYearly ? "Pro Annuel" : "Pro Mensuel",
    });

    await sendEmail({
      to: email,
      subject: "Confirmation de votre abonnement",
      emailComponent: emailElement,
    });
  }
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  try {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    if (!subscription.items?.data?.length) {
      console.log("Pas d'items dans l'abonnement");
      return;
    }

    const subscriptionItem = subscription.items.data[0];
    const priceId = subscriptionItem.price.id;

    const user = await prisma.user.findUnique({
      where: { clientId: customerId },
    });

    if (!user) {
      console.log("Utilisateur non trouvé");
      return;
    }

    const isSubscriptionCanceled =
      subscription.cancel_at || subscription.status === "canceled";

    if (isSubscriptionCanceled) {
      const endDate = new Date(
        (subscription.cancel_at || subscription.current_period_end) * 1000
      );

      await prisma.abonnement.update({
        where: { userId: user.id },
        data: {
          datefin: endDate,
        },
      });

      if (user.email) {
        const emailElement = createElement(EmailSuppressionAbonnement, {
          name: user.name || user.email,
          plan: "Pro",
        });

        await sendEmail({
          to: user.email,
          subject: "Confirmation de résiliation de votre abonnement",
          emailComponent: emailElement,
        });
      }
      return;
    }

    const isYearly = priceId === process.env.STRIPE_YEARLY_PRICE_ID;
    const periode = isYearly ? PlanAbonnement.année : PlanAbonnement.mois;

    const endDate = new Date();
    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const isActive = subscription.status === "active";
    const newPlan = isActive ? Plan.pro : Plan.free;
    const oldPlanData = await prisma.abonnement.findUnique({
      where: { userId: user.id },
    });

    if (
      oldPlanData &&
      (oldPlanData.plan !== newPlan || oldPlanData.periode !== periode)
    ) {
      await prisma.abonnement.update({
        where: { userId: user.id },
        data: {
          plan: newPlan,
          periode: periode,
          datefin: endDate,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: newPlan,
        },
      });

      if (user.email) {
        const emailElement = createElement(EmailChangementAbonnement, {
          name: user.name || user.email,
          plan: isYearly ? "Pro Annuel" : "Pro Mensuel",
          oldPlan:
            oldPlanData.periode === PlanAbonnement.année
              ? "Pro Annuel"
              : "Pro Mensuel",
        });

        await sendEmail({
          to: user.email,
          subject: "Confirmation du changement de votre abonnement",
          emailComponent: emailElement,
        });
      }
    }
  } catch (error) {
    console.error("Erreur dans handleSubscriptionUpdated:", error);
  }
}
