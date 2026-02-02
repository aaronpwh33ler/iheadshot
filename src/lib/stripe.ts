import Stripe from "stripe";

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

// Pricing tiers configuration
export const PRICING_TIERS = {
  basic: {
    name: "Basic",
    price: 2900, // in cents
    headshots: 40,
    priceId: process.env.STRIPE_PRICE_BASIC,
    features: [
      "40 professional headshots",
      "10 different styles",
      "High-resolution downloads",
      "30-day access",
    ],
  },
  pro: {
    name: "Pro",
    price: 3900,
    headshots: 80,
    priceId: process.env.STRIPE_PRICE_PRO,
    popular: true,
    features: [
      "80 professional headshots",
      "20 different styles",
      "High-resolution downloads",
      "60-day access",
      "Priority processing",
    ],
  },
  premium: {
    name: "Premium",
    price: 5900,
    headshots: 120,
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    features: [
      "120 professional headshots",
      "30 different styles",
      "4K resolution downloads",
      "90-day access",
      "Priority processing",
      "Background removal",
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;

// Create a checkout session
export async function createCheckoutSession(
  tier: PricingTier,
  email?: string
): Promise<Stripe.Checkout.Session> {
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
  return stripe.checkout.sessions.retrieve(sessionId);
}
