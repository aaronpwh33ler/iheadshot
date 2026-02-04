// Pricing tiers configuration - safe for client-side usage
// API cost: ~$0.14 per image (Google Gemini image generation)
// + ~$0.14 for character sheet generation per order

export const PRICING_TIERS = {
  basic: {
    name: "Basic",
    price: 999, // $9.99 - Cost: ~$0.85, Margin: ~91%
    headshots: 5,
    features: [
      "5 professional headshots",
      "5 different styles",
      "High-resolution downloads",
      "Instant delivery",
    ],
  },
  standard: {
    name: "Standard",
    price: 1499, // $14.99 - Cost: ~$1.55, Margin: ~89%
    headshots: 10,
    popular: true,
    features: [
      "10 professional headshots",
      "10 different styles",
      "High-resolution downloads",
      "Instant delivery",
      "Priority processing",
    ],
  },
  premium: {
    name: "Premium",
    price: 2499, // $24.99 - Cost: ~$3.00, Margin: ~87%
    headshots: 20,
    features: [
      "20 professional headshots",
      "All 15 styles included",
      "High-resolution downloads",
      "Instant delivery",
      "Priority processing",
      "Best value per headshot",
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;
