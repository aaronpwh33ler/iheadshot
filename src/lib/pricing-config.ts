// Pricing tiers configuration - safe for client-side usage
// This file contains no server-side secrets

export const PRICING_TIERS = {
  basic: {
    name: "Basic",
    price: 1900, // in cents - $19
    headshots: 10,
    features: [
      "10 professional headshots",
      "10 different styles",
      "High-resolution downloads",
      "30-day access",
    ],
  },
  pro: {
    name: "Pro",
    price: 2900, // $29
    headshots: 20,
    popular: true,
    features: [
      "20 professional headshots",
      "20 different styles",
      "High-resolution downloads",
      "60-day access",
      "Priority processing",
    ],
  },
  premium: {
    name: "Premium",
    price: 4900, // $49
    headshots: 20,
    features: [
      "20 premium headshots",
      "20 different styles",
      "4K resolution downloads",
      "90-day access",
      "Premium AI model",
      "Background variations",
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;
