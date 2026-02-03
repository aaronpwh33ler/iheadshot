import { NextRequest, NextResponse } from "next/server";
import { regeneratePremium } from "@/lib/replicate";
import { createAdminSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { orderId, imageUrl, style } = await request.json();

    if (!orderId || !imageUrl || !style) {
      return NextResponse.json(
        { error: "Missing orderId, imageUrl, or style" },
        { status: 400 }
      );
    }

    console.log(`Starting premium regeneration for order ${orderId}, style: ${style}`);

    // Regenerate with premium quality
    const result = await regeneratePremium(imageUrl, style);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to regenerate image" },
        { status: 500 }
      );
    }

    // Save to database
    const supabase = createAdminSupabaseClient();

    const { error: insertError } = await supabase.from("generated_images").insert({
      order_id: orderId,
      image_url: result.imageUrl,
      style: result.style,
      style_name: result.styleName,
      quality: "premium",
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to save premium image:", insertError);
    }

    console.log(`Premium regeneration complete for style: ${style}`);

    return NextResponse.json({
      success: true,
      image: result,
    });
  } catch (error) {
    console.error("Premium regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate premium image" },
      { status: 500 }
    );
  }
}
