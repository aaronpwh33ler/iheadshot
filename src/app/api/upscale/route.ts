import { NextRequest, NextResponse } from "next/server";
import { upscaleWithBloom, batchUpscale, calculateUpscalePrice } from "@/lib/topaz";
import { createAdminSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { orderId, imageUrls, scale = 4, creativity = 1 } = await request.json();

    if (!orderId || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Missing orderId or imageUrls" },
        { status: 400 }
      );
    }

    console.log(`Starting upscale for order ${orderId}: ${imageUrls.length} images at ${scale}x with Realism preset`);

    // Upscale images using Standard V2 with face enhancement
    const results = await batchUpscale(imageUrls, {
      scale,
      outputFormat: "png",
      faceEnhancement: true,
      faceEnhancementCreativity: 0, // Low creativity for faithful upscaling
      orderId, // Pass orderId for organizing uploads
    });

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Failed to upscale any images" },
        { status: 500 }
      );
    }

    // Save upscaled images to database
    const supabase = createAdminSupabaseClient();

    const upscaledRecords = results.map((result) => ({
      order_id: orderId,
      original_url: result.originalUrl,
      upscaled_url: result.upscaledUrl,
      scale_factor: result.scale,
      width: result.width,
      height: result.height,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("upscaled_images")
      .insert(upscaledRecords);

    if (insertError) {
      console.error("Failed to save upscaled images:", insertError);
    }

    console.log(`Upscale complete: ${results.length} images upscaled`);

    return NextResponse.json({
      success: true,
      count: results.length,
      images: results,
      totalCost: calculateUpscalePrice(results.length, scale),
    });
  } catch (error) {
    console.error("Upscale error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upscale images";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to get pricing info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get("count") || "1");

  return NextResponse.json({
    pricing: {
      "2x": calculateUpscalePrice(count, 2),
      "4x": calculateUpscalePrice(count, 4),
      "8x": calculateUpscalePrice(count, 8),
    },
    description: "Upscale your headshots to print-quality resolution using Topaz Bloom AI",
  });
}
