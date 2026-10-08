import type Stripe from "stripe";

/**
 * The plan a Stripe subscription status gives. `past_due`: a renewal payment failed and Stripe is
 * retrying it (smart retries, several days): the club keeps Pro meanwhile. When the retries run out
 * Stripe moves it to `unpaid` / `canceled` (or deletes it), and the club goes back to free then.
 */
export function planOfStatus(status: Stripe.Subscription.Status): "pro" | "free" {
  return status === "active" || status === "trialing" || status === "past_due" ? "pro" : "free";
}

type CancelFields = { cancel_at: number | null; cancel_at_period_end: boolean };

/**
 * The cancellation was scheduled by THIS update (`previous` = Stripe's `previous_attributes`: the old
 * values of the changed fields only). Its email is sent once, not on every later update of a
 * subscription that is still set to end.
 */
export function cancellationJustScheduled(current: CancelFields, previous: Partial<CancelFields> | undefined) {
  const scheduled = (fields: CancelFields) => fields.cancel_at !== null || fields.cancel_at_period_end;
  const before: CancelFields = {
    cancel_at: previous && "cancel_at" in previous ? (previous.cancel_at ?? null) : current.cancel_at,
    cancel_at_period_end:
      previous && "cancel_at_period_end" in previous ? Boolean(previous.cancel_at_period_end) : current.cancel_at_period_end,
  };
  return scheduled(current) && !scheduled(before);
}
