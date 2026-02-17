import { NextRequest, NextResponse } from "next/server";
import {
  generateHeadshotFromReferences,
  imageUrlToBase64,
  HEADSHOT_STYLES,
} from "@/lib/nano-banana";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a single headshot using all uploaded reference images directly.
 * No character sheet needed — uses revised prompt structure.
 */
export async function POST(request: NextRequest) {
  try {
    const {
      orderId,
      imageUrl,        // Legacy: single image URL (backward compat)
      imageUrls,       // New: array of all uploaded image URLs
      styleId,
      variant = 1,
      gender,
      // Custom style overrides from frontend StyleSelector
      customOutfit,
      customLocation,
      customLighting,
      isCustomStyle,
      customPrompt,
    } = await request.json();

    // Support both imageUrls array and legacy single imageUrl
    const urls: string[] = imageUrls || (imageUrl ? [imageUrl] : []);

    if (!orderId || urls.length === 0 || !styleId) {
      return NextResponse.json(
        { error: "Missing orderId, imageUrl(s), or styleId" },
        { status: 400 }
      );
    }

    // Find the style configuration (or build one for custom styles)
    let style = HEADSHOT_STYLES.find((s) => s.id === styleId);
    if (!style && !isCustomStyle) {
      return NextResponse.json(
        { error: `Unknown style: ${styleId}` },
        { status: 400 }
      );
    }

    // Build effective style with custom overrides
    if (isCustomStyle || !style) {
      // Fully custom style
      style = {
        id: styleId,
        name: "Custom Style",
        outfit: customOutfit || "professional business attire",
        location: customLocation || "in a professional studio",
        lighting: customLighting || "soft natural light",
        pose: "standing naturally",
        expression: "confident and approachable",
        promptSentence: customPrompt || `Wearing ${customOutfit || "professional business attire"}, ${customLocation || "in a professional studio"}, ${customLighting || "soft natural light"}, standing naturally, confident and approachable`,
      };
    } else if (customOutfit || customLocation || customLighting) {
      // Preset style with user overrides — rebuild prompt sentence
      const effectiveOutfit = customOutfit || style.outfit;
      const effectiveLocation = customLocation || style.location;
      const effectiveLighting = customLighting || style.lighting;
      style = {
        ...style,
        outfit: effectiveOutfit,
        location: effectiveLocation,
        lighting: effectiveLighting,
        promptSentence: `Wearing ${effectiveOutfit}, ${effectiveLocation}, ${effectiveLighting}, ${style.pose}, ${style.expression}`,
      };
    }

    // Get real order ID from stripe session
    const order = await getOrderByStripeSession(orderId);
    const realOrderId = order?.id || orderId;

    const styleName = isCustomStyle ? "Custom Style" : style.name;
    console.log(`Generating ${styleName} (variant ${variant}) for order ${realOrderId} with ${urls.length} reference image(s)...`);

    // Convert ALL reference images to base64
    const imageResults = await Promise.all(urls.map((url: string) => imageUrlToBase64(url)));
    const base64Images = imageResults.map((r) => r.base64);
    const mimeType = imageResults[0].mimeType;

    // Generate the headshot using all reference images (no character sheet)
    const headshotBase64 = await generateHeadshotFromReferences(
      base64Images,
      style,
      mimeType,
      gender
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
