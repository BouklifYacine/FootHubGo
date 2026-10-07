import { getStripe } from "@/lib/stripe";

/** Cancels every active Stripe subscription of a customer (used when an account is deleted). */
export async function cancelCustomerSubscriptions(customerId: string) {
  const { data } = await getStripe().subscriptions.list({ customer: customerId, status: "active" });
  await Promise.all(data.map((subscription) => getStripe().subscriptions.cancel(subscription.id)));
}
