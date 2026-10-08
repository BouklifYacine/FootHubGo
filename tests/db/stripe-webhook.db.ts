/**
 * The Stripe webhook route, called like Stripe calls it (signed request). Only
 * `customer.subscription.updated` is sent here: it needs no call to the Stripe API.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import Stripe from "stripe";
import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { POST } from "@/app/api/webhooks/stripe/route";
import { sentEmails } from "./setup";
import { createClub, createUser } from "./factories";

const CUSTOMER = "cus_db_test";
const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
let clubId: string;

beforeEach(async () => {
  const owner = await createUser();
  const { club } = await createClub(owner);
  clubId = club.id;
  await prisma.club.update({ where: { id: club.id }, data: { plan: "pro", stripeCustomerId: CUSTOMER } });
  await prisma.subscription.create({ data: { clubId: club.id, plan: "pro", period: "MONTH", endDate: new Date() } });
});

let eventCount = 0;

/** A signed `customer.subscription.updated` delivery. */
function subscriptionUpdated(
  subscription: { status: Stripe.Subscription.Status; cancel_at?: number | null },
  previousAttributes: Record<string, unknown> = {},
  id = `evt_db_${++eventCount}`,
) {
  const payload = JSON.stringify({
    id,
    object: "event",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_db_test",
        object: "subscription",
        customer: CUSTOMER,
        status: subscription.status,
        cancel_at: subscription.cancel_at ?? null,
        cancel_at_period_end: false,
        items: { data: [{ price: { id: "price_month_test" }, current_period_end: periodEnd }] },
      },
      previous_attributes: previousAttributes,
    },
  });
  return async () => {
    const signature = await Stripe.webhooks.generateTestHeaderStringAsync({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET! });
    return POST(new NextRequest("http://localhost/api/webhooks/stripe", { method: "POST", body: payload, headers: { "stripe-signature": signature } }));
  };
}

const clubPlan = async () => (await prisma.club.findUniqueOrThrow({ where: { id: clubId } })).plan;

describe("Stripe webhook", () => {
  test("a forged signature is refused", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/webhooks/stripe", { method: "POST", body: "{}", headers: { "stripe-signature": "t=1,v1=forged" } }),
    );
    expect(response.status).toBe(400);
  });

  test("a renewal moves the end date; a payment being retried keeps Pro", async () => {
    const response = await subscriptionUpdated({ status: "past_due" }, { status: "active" })();

    expect(response.status).toBe(200);
    expect(await clubPlan()).toBe("pro");
    const subscription = await prisma.subscription.findUniqueOrThrow({ where: { clubId } });
    expect(subscription.endDate.getTime()).toBe(periodEnd * 1000);
  });

  test("an unpaid subscription goes back to free", async () => {
    await subscriptionUpdated({ status: "unpaid" }, { status: "past_due" })();
    expect(await clubPlan()).toBe("free");
  });

  test("a retried delivery of a handled event does nothing", async () => {
    const deliver = subscriptionUpdated({ status: "active", cancel_at: periodEnd }, { cancel_at: null });

    expect(await (await deliver()).json()).toEqual({ received: true });
    expect(await (await deliver()).json()).toEqual({ received: true, duplicate: true });
    // The cancellation email went out once.
    expect(sentEmails().filter((email) => email.subject.includes("résiliation"))).toHaveLength(1);
  });

  test("later updates of a subscription set to end don't send the cancellation email again", async () => {
    await subscriptionUpdated({ status: "active", cancel_at: periodEnd }, { cancel_at: null })();
    await subscriptionUpdated({ status: "active", cancel_at: periodEnd }, { metadata: {} })();
    expect(sentEmails().filter((email) => email.subject.includes("résiliation"))).toHaveLength(1);
  });

  test("an event whose handling died half-way is handled by Stripe's next retry", async () => {
    const id = "evt_db_crashed";
    await prisma.stripeEvent.create({
      data: { id, type: "customer.subscription.updated", processedAt: new Date(Date.now() - 10 * 60_000) },
    });

    const response = await subscriptionUpdated({ status: "unpaid" }, { status: "past_due" }, id)();

    expect(await response.json()).toEqual({ received: true });
    expect(await clubPlan()).toBe("free");
    expect((await prisma.stripeEvent.findUniqueOrThrow({ where: { id } })).handledAt).not.toBeNull();
  });

  test("an event being handled right now is not handled twice", async () => {
    const id = "evt_db_in_progress";
    await prisma.stripeEvent.create({ data: { id, type: "customer.subscription.updated" } });

    const response = await subscriptionUpdated({ status: "unpaid" }, { status: "past_due" }, id)();

    expect(response.status).toBe(409);
    expect(await clubPlan()).toBe("pro");
  });
});
