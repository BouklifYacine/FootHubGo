import { createElement } from "react";
import type Stripe from "stripe";
import { prisma } from "@/prisma";
import type { Plan, SubscriptionPeriod } from "@/generated/prisma/client";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/emails/send-email";
import {
  SubscriptionCanceledEmail,
  SubscriptionChangedEmail,
  SubscriptionStartedEmail,
} from "@/emails/subscription-emails";

/**
 * One handler per Stripe event type, called by `app/api/webhooks/stripe/route.ts`.
 *
 * The subscription belongs to a CLUB (paid by its OWNER, emails go to the owner). Legacy: users
 * who subscribed before clubs existed and own no club keep a per-user subscription
 * (`User.clientId` / `Subscription.userId`), still handled here.
 */

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

/** Who pays: a club (through its owner) or, legacy, a user without a club. */
type Payer =
  | { kind: "club"; clubId: string; customerId: string | null; name: string; email: string }
  | { kind: "user"; userId: string; customerId: string | null; name: string; email: string };

async function clubPayer(clubId: string): Promise<Payer | null> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      stripeCustomerId: true,
      members: { where: { role: "OWNER" }, select: { user: { select: { name: true, email: true } } } },
    },
  });
  const owner = club?.members[0]?.user;
  if (!club || !owner) return null;
  return { kind: "club", clubId: club.id, customerId: club.stripeCustomerId, ...owner };
}

/** A user id from a checkout: their club when they own one, otherwise the user (legacy). */
async function payerOfUser(user: { id: string; name: string; email: string; clientId: string | null }) {
  const owned = await prisma.clubMember.findFirst({ where: { userId: user.id, role: "OWNER" }, select: { clubId: true } });
  if (owned) return clubPayer(owned.clubId);
  return { kind: "user" as const, userId: user.id, customerId: user.clientId, name: user.name, email: user.email };
}

async function payerOfCustomer(customerId: string | null): Promise<Payer | null> {
  if (!customerId) return null;
  const club = await prisma.club.findUnique({ where: { stripeCustomerId: customerId }, select: { id: true } });
  if (club) return clubPayer(club.id);
  const user = await prisma.user.findUnique({ where: { clientId: customerId } });
  return user ? { kind: "user", userId: user.id, customerId, name: user.name, email: user.email } : null;
}

const subscriptionWhere = (payer: Payer) => (payer.kind === "club" ? { clubId: payer.clubId } : { userId: payer.userId });

/** The plan (and the Stripe customer once known) of the club or the legacy user. */
function setPlan(payer: Payer, plan: Plan, customerId?: string | null) {
  if (payer.kind === "club") {
    return prisma.club.update({
      where: { id: payer.clubId },
      data: { plan, ...(customerId !== undefined && { stripeCustomerId: customerId }) },
    });
  }
  return prisma.user.update({
    where: { id: payer.userId },
    data: { plan, ...(customerId !== undefined && { clientId: customerId }) },
  });
}

export async function handleCheckoutCompleted(event: Stripe.CheckoutSessionCompletedEvent) {
  const session = await getStripe().checkout.sessions.retrieve(event.data.object.id, {
    expand: ["line_items"],
  });

  // Club checkouts (`startClubCheckout`) carry the club id. Older payment links carried a user id
  // (`client_reference_id`), or only the email typed in Checkout, which is not proven: it only
  // matches an account whose address has been verified.
  const clubId = session.metadata?.clubId;
  let payer: Payer | null = null;
  if (clubId) {
    payer = await clubPayer(clubId);
  } else {
    const email = session.customer_details?.email?.toLowerCase();
    const user = session.client_reference_id
      ? await prisma.user.findUnique({ where: { id: session.client_reference_id } })
      : email
        ? await prisma.user.findFirst({ where: { email, emailVerified: true } })
        : null;
    if (user) payer = await payerOfUser(user);
  }
  if (!payer) {
    console.warn("[stripe] checkout without a matching club or user", session.id);
    return;
  }

  const price = session.line_items?.data[0]?.price;
  if (price?.type !== "recurring") return;

  const period = periodOf(price.id);
  const subscription = { plan: "pro" as const, period, startDate: new Date(), endDate: endOfPeriod(period) };

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: subscriptionWhere(payer),
      create: { ...subscriptionWhere(payer), ...subscription },
      update: subscription,
    }),
    setPlan(payer, "pro", payer.customerId ?? customerIdOf(session.customer)),
  ]);

  await sendEmail({
    to: payer.email,
    subject: "Confirmation de ton abonnement",
    email: createElement(SubscriptionStartedEmail, { name: payer.name, plan: planLabel(period) }),
  });
}

export async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  const stripeSubscription = event.data.object;
  const item = stripeSubscription.items.data[0];
  if (!item) return;

  const payer = await payerOfCustomer(customerIdOf(stripeSubscription.customer));
  if (!payer) return;

  // Cancellation scheduled: the subscription stays active until the end of the paid period.
  if (stripeSubscription.cancel_at || stripeSubscription.status === "canceled") {
    const endDate = new Date((stripeSubscription.cancel_at ?? item.current_period_end) * 1000);
    await prisma.subscription.updateMany({ where: subscriptionWhere(payer), data: { endDate } });
    await sendEmail({
      to: payer.email,
      subject: "Confirmation de résiliation de ton abonnement",
      email: createElement(SubscriptionCanceledEmail, { name: payer.name, endDate }),
    });
    return;
  }

  const period = periodOf(item.price.id);
  const plan = stripeSubscription.status === "active" ? "pro" : "free";
  const previous = await prisma.subscription.findFirst({ where: subscriptionWhere(payer) });
  if (!previous || (previous.plan === plan && previous.period === period)) return;

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: previous.id },
      data: { plan, period, endDate: endOfPeriod(period) },
    }),
    setPlan(payer, plan),
  ]);

  await sendEmail({
    to: payer.email,
    subject: "Confirmation du changement de ton abonnement",
    email: createElement(SubscriptionChangedEmail, {
      name: payer.name,
      oldPlan: planLabel(previous.period),
      plan: planLabel(period),
    }),
  });
}

export async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const payer = await payerOfCustomer(customerIdOf(event.data.object.customer));
  if (!payer) return;

  await prisma.$transaction([
    prisma.subscription.deleteMany({ where: subscriptionWhere(payer) }),
    setPlan(payer, "free", null),
  ]);

  await sendEmail({
    to: payer.email,
    subject: "Ton abonnement est terminé",
    email: createElement(SubscriptionCanceledEmail, { name: payer.name }),
  });
}
