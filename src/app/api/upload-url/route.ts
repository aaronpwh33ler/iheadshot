import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { getCheckoutSession, PRICING_TIERS, type PricingTier } from "@/lib/stripe";
import { v4 as uuidv4 } from "uuid";

// Returns a signed upload URL so the client can upload directly to Supabase Storage,
// bypassing Vercel's serverless body size limit entirely.
export async function POST(request: NextRequest) {
  try {
    const { orderId: stripeSessionId, fileName, contentType } = await request.json();

    if (!stripeSessionId || !fileName) {
      return NextResponse.json(
        { error: "Missing orderId or fileName" },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (contentType && !allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Look up the order by stripe session ID
    let order = await getOrderByStripeSession(stripeSessionId);
    let debugInfo = { step: "initial-lookup", found: !!order };

    // Fallback: if webhook hasn't fired yet, verify with Stripe and create the order
    if (!order) {
      console.log("Order not found via webhook, checking Stripe directly:", stripeSessionId);
      try {
        const session = await getCheckoutSession(stripeSessionId);
        debugInfo = { ...debugInfo, step: "stripe-verified", found: false } as typeof debugInfo;

        console.log("Stripe session:", {
          id: session.id,
          payment_status: session.payment_status,
          tier: session.metadata?.tier,
          email: session.customer_email || session.customer_details?.email,
        });

        if (session.payment_status !== "paid") {
          return NextResponse.json(
            { error: `Payment status is "${session.payment_status}", not "paid". Please complete checkout first.` },
            { status: 402 }
          );
        }

        // Create the order that the webhook would have created
        const tier = (session.metadata?.tier || "standard") as PricingTier;
        const tierConfig = PRICING_TIERS[tier];

        if (!tierConfig) {
          return NextResponse.json(
            { error: `Unknown tier "${tier}" from Stripe metadata. Available: ${Object.keys(PRICING_TIERS).join(", ")}` },
            { status: 500 }
          );
        }

        const supabase = createAdminSupabaseClient();
        const orderData = {
          email: session.customer_email || session.customer_details?.email || "",
          stripe_session_id: session.id,
          stripe_payment_intent: (session.payment_intent as string) || "",
          amount: session.amount_total || tierConfig.price,
          tier: tier,
          headshot_count: tierConfig.headshots,
          status: "paid" as const,
        };

        console.log("Attempting order insert:", orderData);

        const { data: newOrder, error: insertError } = await supabase
          .from("orders")
          .insert(orderData)
          .select()
          .single();

        if (insertError) {
          console.error("Insert error details:", JSON.stringify(insertError));
          // Could be a duplicate if webhook fired in the meantime — try fetching again
          order = await getOrderByStripeSession(stripeSessionId);
          if (!order) {
            return NextResponse.json(
              { error: `Failed to create order: ${insertError.message}. Retry fetch also failed.` },
              { status: 500 }
            );
          }
        } else if (newOrder) {
          order = newOrder;
          console.log("Order created via fallback:", newOrder.id);
        }
      } catch (stripeError: unknown) {
        const msg = stripeError instanceof Error ? stripeError.message : String(stripeError);
        console.error("Stripe session verification failed:", msg);
        return NextResponse.json(
          { error: `Stripe verification failed: ${msg}` },
          { status: 500 }
        );
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order could not be created or found. Please contact support.", debug: debugInfo },
        { status: 404 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Generate unique file path
    const fileExtension = fileName.split(".").pop() || "jpg";
    const uniqueName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${order.id}/${uniqueName}`;

    // Create signed upload URL (valid for 2 minutes)
    const { data, error } = await supabase.storage
      .from("headshots")
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      console.error("Failed to create signed upload URL:", error);
      return NextResponse.json(
        { error: "Failed to create upload URL" },
        { status: 500 }
      );
    }

    // Get the public URL for this path (for later use)
    const { data: urlData } = supabase.storage
      .from("headshots")
      .getPublicUrl(filePath);

    // Save to uploads table
    const { error: dbError } = await supabase.from("uploads").insert({
      order_id: order.id,
      file_path: filePath,
      file_name: fileName,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      // Non-blocking — file path is still valid
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: filePath,
      publicUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Upload URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
