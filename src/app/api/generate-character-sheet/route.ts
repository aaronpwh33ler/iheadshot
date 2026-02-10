import { NextRequest, NextResponse } from "next/server";
import { generateCharacterSheet, imageUrlToBase64 } from "@/lib/nano-banana";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a character reference sheet from uploaded images
 * This creates a multi-angle view (front, profiles, 3/4) to lock in identity.
 * Accepts multiple imageUrls for better identity capture.
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, imageUrl, imageUrls } = await request.json();

    // Support single imageUrl or array of imageUrls
    const urls: string[] = imageUrls || (imageUrl ? [imageUrl] : []);

    if (!orderId || urls.length === 0) {
      return NextResponse.json(
        { error: "Missing orderId or imageUrl(s)" },
        { status: 400 }
      );
    }

    // Get real order ID from stripe session
    const order = await getOrderByStripeSession(orderId);
    const realOrderId = order?.id || orderId;

    console.log(`Generating character sheet for order ${realOrderId} with ${urls.length} reference image(s)...`);

    // Convert ALL image URLs to base64
    const imageResults = await Promise.all(urls.map((url: string) => imageUrlToBase64(url)));
    const base64Images = imageResults.map((r) => r.base64);
    const mimeType = imageResults[0].mimeType;

    // Generate the character sheet using Nano Banana Pro with ALL reference images
    const characterSheetBase64 = await generateCharacterSheet(base64Images, mimeType);

    // Save to Supabase storage
    const supabase = createAdminSupabaseClient();
    const fileName = `${uuidv4()}-character-sheet.jpg`;
    const filePath = `character-sheets/${realOrderId}/${fileName}`;

    // Convert base64 to buffer for upload
    const imageBuffer = Buffer.from(characterSheetBase64, "base64");

    const { error: uploadError } = await supabase.storage
      .from("headshots")
      .upload(filePath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload character sheet");
    }

    const { data: urlData } = supabase.storage
      .from("headshots")
      .getPublicUrl(filePath);

    const characterSheetUrl = urlData.publicUrl;

    // Save reference to database
    await supabase.from("character_sheets").insert({
      order_id: realOrderId,
      image_url: characterSheetUrl,
      source_image_url: imageUrl,
      created_at: new Date().toISOString(),
    });

    console.log(`Character sheet generated for order ${realOrderId}`);

    return NextResponse.json({
      success: true,
      characterSheetUrl,
      characterSheetBase64, // Also return base64 for immediate use in generation
    });
  } catch (error) {
    console.error("Character sheet generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate character sheet" },
      { status: 500 }
    );
  }
}
