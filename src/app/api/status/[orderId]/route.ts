import { NextRequest, NextResponse } from "next/server";
import {
  getOrder,
  getTrainingJob,
  getGeneratedImages,
} from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Get order
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Get training job
    const trainingJob = await getTrainingJob(orderId);

    // Get generated images
    const images = await getGeneratedImages(orderId);

    // Calculate progress
    let progress = 0;
    let message = "";
    let estimatedTime = "";

    switch (order.status) {
      case "pending":
        progress = 0;
        message = "Waiting for payment...";
        break;
      case "paid":
        progress = 10;
        message = "Payment received. Upload your photos to get started.";
        break;
      case "training":
        progress = 30;
        message = "AI is learning your unique features...";
        estimatedTime = "10-15 minutes";
        break;
      case "generating":
        // Calculate based on images generated
        const targetCount = order.headshot_count;
        const generatedCount = images.length;
        progress = 50 + Math.floor((generatedCount / targetCount) * 45);
        message = `Generating headshots... ${generatedCount}/${targetCount}`;
        estimatedTime = `${Math.ceil((targetCount - generatedCount) / 4)} minutes`;
        break;
      case "completed":
        progress = 100;
        message = "Your headshots are ready!";
        break;
      case "failed":
        progress = 0;
        message = "Something went wrong. We're looking into it.";
        break;
    }

    return NextResponse.json({
      status: order.status,
      tier: order.tier,
      headshot_count: order.headshot_count,
      progress,
      message,
      estimatedTime,
      imageCount: images.length,
      trainingStatus: trainingJob?.status,
      images: order.status === "completed" ? images : undefined,
    });
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}
