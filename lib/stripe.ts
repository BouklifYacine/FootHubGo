import Stripe from "stripe";

let client: Stripe | undefined;

/**
 * Stripe client, created on first use: importing this file must not require the secret key
 * (`next build` loads the routes, and the Docker image is built without secrets).
 */
export function getStripe() {
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2026-09-30.endive",
    typescript: true,
  });
  return client;
}
