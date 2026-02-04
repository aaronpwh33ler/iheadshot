import { NextRequest, NextResponse } from "next/server";
import {
  generateHeadshotWithIdentityLock,
  imageUrlToBase64,
  HEADSHOT_STYLES,
} from "@/lib/nano-banana";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a single headshot using the identity lock method
 * Requires both the reference image and character sheet for maximum consistency
 */
export async function POST(request: NextRequest) {
  try {
    const {
      orderId,
      imageUrl,
      characterSheetUrl,
      characterSheetBase64: providedCharacterSheetBase64,
      styleId,
      variant = 1,
    } = await request.json();

    if (!orderId || !imageUrl || !styleId) {
      return NextResponse.json(
        { error: "Missing orderId, imageUrl, or styleId" },
        { status: 400 }
      );
    }

    // Find the style configuration
    const style = HEADSHOT_STYLES.find((s) => s.id === styleId);
    if (!style) {
      return NextResponse.json(
        { error: `Unknown style: ${styleId}` },
        { status: 400 }
      );
    }

    // Get real order ID from stripe session
    const order = await getOrderByStripeSession(orderId);
    const realOrderId = order?.id || orderId;

    console.log(`Generating ${style.name} (variant ${variant}) for order ${realOrderId}...`);

    // Convert reference image to base64
    const { base64: referenceBase64, mimeType } = await imageUrlToBase64(imageUrl);

    // Get character sheet base64 (either provided or fetch from URL)
    let characterSheetBase64 = providedCharacterSheetBase64;
    if (!characterSheetBase64 && characterSheetUrl) {
      const result = await imageUrlToBase64(characterSheetUrl);
      characterSheetBase64 = result.base64;
    }

    if (!characterSheetBase64) {
      return NextResponse.json(
        { error: "Character sheet required for identity lock" },
        { status: 400 }
      );
    }

    // Generate the headshot with identity lock
    const headshotBase64 = await generateHeadshotWithIdentityLock(
      referenceBase64,
      characterSheetBase64,
      style,
      mimeType
    );

    // Save to Supabase storage
    const supabase = createAdminSupabaseClient();
    const fileName = `${uuidv4()}-${styleId}-v${variant}.jpg`;
    const filePath = `generated/${realOrderId}/${fileName}`;

    const imageBuffer = Buffer.from(headshotBase64, "base64");

    const { error: uploadError } = await supabase.storage
      .from("headshots")
      .upload(filePath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload headshot");
    }

    const { data: urlData } = supabase.storage
      .from("headshots")
      .getPublicUrl(filePath);

    const headshotUrl = urlData.publicUrl;

    // Save to database
    await supabase.from("generated_images").insert({
      order_id: realOrderId,
      image_url: headshotUrl,
      style: styleId,
      style_name: variant > 1 ? `${style.name} #${variant}` : style.name,
      quality: "premium", // Nano Banana Pro is always premium quality
      created_at: new Date().toISOString(),
    });

    console.log(`Completed ${style.name} variant ${variant}`);

    return NextResponse.json({
      success: true,
      image: {
        id: `${styleId}-${variant}-${Date.now()}`,
        style: styleId,
        styleName: variant > 1 ? `${style.name} #${variant}` : style.name,
        imageUrl: headshotUrl,
        quality: "premium",
        variant,
      },
    });
  } catch (error) {
    console.error("Headshot generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate headshot" },
      { status: 500 }
    );
  }
}
