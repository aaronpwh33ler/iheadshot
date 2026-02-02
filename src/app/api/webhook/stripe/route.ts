import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, PRICING_TIERS, type PricingTier } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/resend";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const supabase = createAdminSupabaseClient();

      // Get tier info from metadata
      const tier = session.metadata?.tier as PricingTier;
      const tierConfig = PRICING_TIERS[tier];

      // Create order in database
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          email: session.customer_email || session.customer_details?.email,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          amount: session.amount_total || tierConfig.price,
          tier: tier,
          headshot_count: tierConfig.headshots,
          status: "paid",
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to create order:", error);
        throw error;
      }

      // Send confirmation email
      if (order.email) {
        await sendOrderConfirmation(
          order.email,
          order.id,
          tier,
          tierConfig.headshots
        );
      }

      console.log("Order created:", order.id);
    } catch (error) {
      console.error("Failed to process checkout:", error);
      return NextResponse.json(
        { error: "Failed to process checkout" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
