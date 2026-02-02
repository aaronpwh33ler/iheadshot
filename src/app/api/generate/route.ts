import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getOrder, updateOrderStatus } from "@/lib/supabase";
import { generateHeadshots, getHeadshotPrompts, calculatePromptsNeeded } from "@/lib/astria";

export async function POST(request: NextRequest) {
  try {
    const { orderId, tuneId } = await request.json();

    if (!orderId || !tuneId) {
      return NextResponse.json(
        { error: "Missing orderId or tuneId" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Calculate number of prompts needed
    const promptsNeeded = calculatePromptsNeeded(order.headshot_count);
    const prompts = getHeadshotPrompts(promptsNeeded);

    // Create callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/astria`;

    // Generate headshots
    const responses = await generateHeadshots(tuneId, prompts, callbackUrl);

    // Update order status
    await updateOrderStatus(orderId, "generating");

    // Update training job with generation info
    await supabase
      .from("training_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    return NextResponse.json({
      success: true,
      promptCount: prompts.length,
      responses: responses.length,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate headshots" },
      { status: 500 }
    );
  }
}
