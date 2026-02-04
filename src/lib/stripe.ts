import Stripe from "stripe";
import { PRICING_TIERS, type PricingTier } from "./pricing-config";

// Re-export for convenience
export { PRICING_TIERS, type PricingTier } from "./pricing-config";

// Server-side Stripe client - only initialized when actually used
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

// Get the price ID for a tier (server-side only)
function getPriceId(tier: PricingTier): string {
  const priceIds: Record<PricingTier, string | undefined> = {
    basic: process.env.STRIPE_PRICE_BASIC,
    standard: process.env.STRIPE_PRICE_STANDARD,
    premium: process.env.STRIPE_PRICE_PREMIUM,
  };

  const priceId = priceIds[tier];
  if (!priceId) {
    throw new Error(`Price ID not configured for tier: ${tier}`);
  }
  return priceId;
}

// Create a checkout session
export async function createCheckoutSession(
  tier: PricingTier,
  email?: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const tierConfig = PRICING_TIERS[tier];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tierConfig.name} Headshots`,
            description: `${tierConfig.headshots} professional AI headshots`,
          },
          unit_amount: tierConfig.price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upload/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: email,
    metadata: {
      tier,
      headshot_count: tierConfig.headshots.toString(),
    },
  });

  return session;
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

// Get checkout session details
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}
