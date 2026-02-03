import { NextRequest, NextResponse } from "next/server";
import { generateInstantHeadshots, getAvailableStyles } from "@/lib/replicate";
import { createAdminSupabaseClient, updateOrderStatus } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { orderId, imageUrl, styles, quality = "standard" } = await request.json();

    if (!orderId || !imageUrl) {
      return NextResponse.json(
        { error: "Missing orderId or imageUrl" },
        { status: 400 }
      );
    }

    // Default to 5 most popular styles if none specified
    const selectedStyles = styles || ["corporate", "business-casual", "creative", "outdoor", "executive"];

    console.log(`Starting instant generation for order ${orderId} with ${selectedStyles.length} styles`);

    // Generate headshots instantly (no training!)
    const results = await generateInstantHeadshots(imageUrl, selectedStyles, quality);

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate any headshots" },
        { status: 500 }
      );
    }

    // Save results to database
    const supabase = createAdminSupabaseClient();

    const imageRecords = results.map((result) => ({
      order_id: orderId,
      image_url: result.imageUrl,
      style: result.style,
      style_name: result.styleName,
      quality: result.quality,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("generated_images")
      .insert(imageRecords);

    if (insertError) {
      console.error("Failed to save images:", insertError);
    }

    // Update order status to completed
    await updateOrderStatus(orderId, "completed");

    console.log(`Instant generation complete: ${results.length} headshots generated`);

    return NextResponse.json({
      success: true,
      count: results.length,
      images: results,
      availableStyles: getAvailableStyles(),
    });
  } catch (error) {
    console.error("Instant generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate headshots" },
      { status: 500 }
    );
  }
}

// GET endpoint to check available styles
export async function GET() {
  return NextResponse.json({
    styles: getAvailableStyles(),
  });
}
