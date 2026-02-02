// Pricing tiers configuration - safe for client-side usage
// This file contains no server-side secrets

export const PRICING_TIERS = {
  basic: {
    name: "Basic",
    price: 2900, // in cents
    headshots: 40,
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
