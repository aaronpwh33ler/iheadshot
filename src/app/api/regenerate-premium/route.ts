import { NextRequest, NextResponse } from "next/server";
import {
  generateHeadshotFromReferences,
  imageUrlToBase64,
  HEADSHOT_STYLES,
} from "@/lib/nano-banana";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { orderId, imageUrls, imageUrl, styleId, gender = "male" } = await request.json();

    // Support both imageUrls array and legacy single imageUrl
    const urls: string[] = imageUrls || (imageUrl ? [imageUrl] : []);

    if (!orderId || urls.length === 0 || !styleId) {
      return NextResponse.json(
        { error: "Missing orderId, imageUrl(s), or styleId" },
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

    console.log(`Starting premium regeneration for order ${realOrderId}, style: ${styleId}`);

    // Convert ALL reference images to base64
    const imageResults = await Promise.all(urls.map((url: string) => imageUrlToBase64(url)));
    const base64Images = imageResults.map((r) => r.base64);
    const mimeType = imageResults[0].mimeType;

    // Generate the headshot using all reference images
    const headshotBase64 = await generateHeadshotFromReferences(
      base64Images,
      style,
      mimeType,
      gender
    );

    // Save to Supabase storage
    const supabase = createAdminSupabaseClient();
    const fileName = `${uuidv4()}-${styleId}-premium.jpg`;
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
    const { error: insertError } = await supabase.from("generated_images").insert({
      order_id: realOrderId,
      image_url: headshotUrl,
      style: styleId,
      style_name: style.name + " (Premium)",
      quality: "premium",
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to save premium image:", insertError);
    }

    console.log(`Premium regeneration complete for style: ${styleId}`);

    return NextResponse.json({
      success: true,
      image: {
        id: `${styleId}-premium-${Date.now()}`,
        style: styleId,
        styleName: style.name + " (Premium)",
        imageUrl: headshotUrl,
        quality: "premium",
      },
    });
  } catch (error) {
    console.error("Premium regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate premium image" },
      { status: 500 }
    );
  }
}
