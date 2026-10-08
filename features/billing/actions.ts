"use server";

import { action } from "@/lib/actions/action";
import { requireClubPermission } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { getStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/features/clubs/schemas";

const priceIds = () => ({
  MONTH: process.env.STRIPE_MONTHLY_PRICE_ID,
  YEAR: process.env.STRIPE_YEARLY_PRICE_ID,
});

/**
 * Stripe Checkout for the CLUB subscription, paid by its OWNER. The club id travels in the session
 * metadata (`handleCheckoutCompleted` attaches the subscription to the club).
 */
export const startClubCheckout = action(checkoutSchema, async ({ period }) => {
  const { user, membership } = await requireClubPermission("manageBilling");
  const priceId = priceIds()[period];
  if (!priceId || !process.env.STRIPE_SECRET_KEY) {
    throw new AppError("Le paiement en ligne n'est pas encore disponible");
  }
  if (membership.club.plan === "pro") throw new AppError("Ton club est déjà abonné");

  const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: membership.clubId,
    metadata: { clubId: membership.clubId, ownerId: user.id },
    subscription_data: { metadata: { clubId: membership.clubId } },
    ...(membership.club.stripeCustomerId
      ? { customer: membership.club.stripeCustomerId }
      : { customer_email: user.email }),
    locale: "fr",
    success_url: `${appUrl}/app/club?abonnement=ok`,
    cancel_url: `${appUrl}/app/club`,
  });
  if (!session.url) throw new AppError("Le paiement n'a pas pu démarrer, réessaie");
  return { message: "Redirection vers le paiement sécurisé", data: { url: session.url } };
});
