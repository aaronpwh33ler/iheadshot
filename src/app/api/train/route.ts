import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getOrderByStripeSession, updateOrderStatus } from "@/lib/supabase";
import { createTune } from "@/lib/astria";
import { sendTrainingStarted } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    // The orderId from the URL is actually the Stripe session ID
    // Look up the order by stripe_session_id
    const order = await getOrderByStripeSession(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check order status
    if (order.status !== "paid") {
      return NextResponse.json(
        { error: "Order not in correct state for training" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Get uploaded images (stored with stripe session ID as order_id)
    const { data: uploads, error: uploadsError } = await supabase
      .from("uploads")
      .select("file_path")
      .eq("order_id", orderId);

    if (uploadsError || !uploads || uploads.length === 0) {
      return NextResponse.json(
        { error: "No images found for this order" },
        { status: 400 }
      );
    }

    // Validate minimum number of images
    if (uploads.length < 10) {
      return NextResponse.json(
        { error: "Minimum 10 images required for training" },
        { status: 400 }
      );
    }

    // Get public URLs for all uploaded images
    const imageUrls = uploads.map((upload) => {
      const { data } = supabase.storage
        .from("headshots")
        .getPublicUrl(upload.file_path);
      return data.publicUrl;
    });

    // Create callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/astria`;

    // Create fine-tuning job
    const tune = await createTune(
      imageUrls,
      `headshot-${order.id}`,
      callbackUrl
    );

    // Create training job record using the real order ID
    const { error: jobError } = await supabase.from("training_jobs").insert({
      order_id: order.id,
      astria_tune_id: tune.id.toString(),
      status: "training",
    });

    if (jobError) {
      console.error("Failed to create training job record:", jobError);
    }

    // Update order status using the real order ID
    await updateOrderStatus(order.id, "training");

    // Send email notification
    if (order.email) {
      await sendTrainingStarted(order.email, order.id);
    }

    return NextResponse.json({
      success: true,
      tuneId: tune.id,
      status: tune.status,
    });
  } catch (error) {
    console.error("Training error:", error);
    return NextResponse.json(
      { error: "Failed to start training" },
      { status: 500 }
    );
  }
}
