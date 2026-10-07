import { createElement } from "react";
import type Stripe from "stripe";
import { prisma } from "@/prisma";
import type { SubscriptionPeriod } from "@/generated/prisma/client";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/emails/send-email";
import {
  SubscriptionCanceledEmail,
  SubscriptionChangedEmail,
  SubscriptionStartedEmail,
} from "@/emails/subscription-emails";

/** One handler per Stripe event type, called by `app/api/webhooks/stripe/route.ts`. */

const planLabel = (period: SubscriptionPeriod) => (period === "YEAR" ? "Pro Annuel" : "Pro Mensuel");

function periodOf(priceId: string): SubscriptionPeriod {
  return priceId === process.env.STRIPE_YEARLY_PRICE_ID ? "YEAR" : "MONTH";
}

function endOfPeriod(period: SubscriptionPeriod, from = new Date()) {
  const end = new Date(from);
  if (period === "YEAR") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

const customerIdOf = (customer: string | { id: string } | null) =>
  typeof customer === "string" ? customer : (customer?.id ?? null);

function findUserByCustomer(customerId: string | null) {
  return customerId ? prisma.user.findUnique({ where: { clientId: customerId } }) : null;
}

export async function handleCheckoutCompleted(event: Stripe.CheckoutSessionCompletedEvent) {
  const session = await getStripe().checkout.sessions.retrieve(event.data.object.id, {
    expand: ["line_items"],
  });

  // Prefer the user id passed to the checkout (`client_reference_id`), fall back on the email.
  const email = session.customer_details?.email;
  const user = session.client_reference_id
    ? await prisma.user.findUnique({ where: { id: session.client_reference_id } })
    : email
      ? await prisma.user.findUnique({ where: { email } })
      : null;
  if (!user) {
    console.warn("[stripe] checkout without a matching user", session.id);
    return;
  }

  const price = session.line_items?.data[0]?.price;
  if (price?.type !== "recurring") return;

  const period = periodOf(price.id);
  const subscription = { plan: "pro" as const, period, startDate: new Date(), endDate: endOfPeriod(period) };

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...subscription },
      update: subscription,
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { plan: "pro", clientId: user.clientId ?? customerIdOf(session.customer) },
    }),
  ]);

  await sendEmail({
    to: user.email,
    subject: "Confirmation de votre abonnement",
    email: createElement(SubscriptionStartedEmail, { name: user.name, plan: planLabel(period) }),
  });
}

export async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  const stripeSubscription = event.data.object;
  const item = stripeSubscription.items.data[0];
  if (!item) return;

  const user = await findUserByCustomer(customerIdOf(stripeSubscription.customer));
  if (!user) return;

  // Cancellation scheduled: the subscription stays active until the end of the paid period.
  if (stripeSubscription.cancel_at || stripeSubscription.status === "canceled") {
    const endDate = new Date((stripeSubscription.cancel_at ?? item.current_period_end) * 1000);
    await prisma.subscription.updateMany({ where: { userId: user.id }, data: { endDate } });
    await sendEmail({
      to: user.email,
      subject: "Confirmation de résiliation de votre abonnement",
      email: createElement(SubscriptionCanceledEmail, { name: user.name, endDate }),
    });
    return;
  }

  const period = periodOf(item.price.id);
  const plan = stripeSubscription.status === "active" ? "pro" : "free";
  const previous = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!previous || (previous.plan === plan && previous.period === period)) return;

  await prisma.$transaction([
    prisma.subscription.update({
      where: { userId: user.id },
      data: { plan, period, endDate: endOfPeriod(period) },
    }),
    prisma.user.update({ where: { id: user.id }, data: { plan } }),
  ]);

  await sendEmail({
    to: user.email,
    subject: "Confirmation du changement de votre abonnement",
    email: createElement(SubscriptionChangedEmail, {
      name: user.name,
      oldPlan: planLabel(previous.period),
      plan: planLabel(period),
    }),
  });
}

export async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const user = await findUserByCustomer(customerIdOf(event.data.object.customer));
  if (!user) return;

  await prisma.$transaction([
    prisma.subscription.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({ where: { id: user.id }, data: { plan: "free", clientId: null } }),
  ]);

  await sendEmail({
    to: user.email,
    subject: "Votre abonnement est terminé",
    email: createElement(SubscriptionCanceledEmail, { name: user.name }),
  });
}

