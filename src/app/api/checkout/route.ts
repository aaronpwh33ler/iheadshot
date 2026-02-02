import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, PRICING_TIERS, type PricingTier } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, email } = body;

    // Validate tier
    if (!tier || !PRICING_TIERS[tier as PricingTier]) {
      return NextResponse.json(
        { error: "Invalid pricing tier" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(tier as PricingTier, email);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
