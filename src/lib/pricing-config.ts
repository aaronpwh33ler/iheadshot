// Pricing tiers configuration - safe for client-side usage
// API cost: ~$0.04 per image (Replicate FLUX Kontext Pro)

export const PRICING_TIERS = {
  basic: {
    name: "Basic",
    price: 499, // $4.99 - Cost: $0.40, Profit: $4.59, Margin: 92%
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
    price: 899, // $8.99 - Cost: $0.80, Profit: $8.19, Margin: 91%
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
    price: 1499, // $14.99 - Cost: $0.80, Profit: $14.19, Margin: 95%
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
