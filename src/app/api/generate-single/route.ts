import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// SIMPLIFIED PROMPTS - Focus ONLY on background/lighting
// Key insight: simpler prompts preserve likeness better
// Every prompt includes "maintain exact facial features and likeness"
const HEADSHOT_STYLES: Record<string, { name: string; prompt: string }> = {
  // === OUTDOOR (these work best for likeness!) ===
  "outdoor-natural": {
    name: "Natural Light",
    prompt: "Professional portrait photograph of this exact person. Outdoor setting with natural greenery background, soft bokeh, golden hour warm sunlight, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },
  "outdoor-sunset": {
    name: "Golden Hour",
    prompt: "Professional portrait photograph of this exact person. Beautiful golden sunset background with warm orange and pink tones, soft natural bokeh, warm glowing light on face, sharp focus, maintain exact facial features and likeness, high resolution",
  },
  "outdoor-park": {
    name: "Park Setting",
    prompt: "Professional portrait photograph of this exact person. Lush green park background with trees and foliage in soft bokeh, dappled natural sunlight, warm and inviting, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },
  "outdoor-urban": {
    name: "City Background",
    prompt: "Professional portrait photograph of this exact person. Blurred urban city background with buildings in soft bokeh, natural daylight, modern professional style, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },

  // === STUDIO BACKGROUNDS ===
  "studio-white": {
    name: "Pure White",
    prompt: "Professional studio portrait photograph of this exact person. Pure clean white background, soft even studio lighting, classic headshot style, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },
  "studio-light-gray": {
    name: "Light Gray",
    prompt: "Professional studio portrait photograph of this exact person. Soft light gray background, gentle studio lighting, neutral professional look, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },
  "studio-dark": {
    name: "Dark Gradient",
    prompt: "Professional studio portrait photograph of this exact person. Dark charcoal to black gradient background, dramatic studio lighting with soft shadows, executive portrait style, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },
  "studio-warm": {
    name: "Warm Beige",
    prompt: "Professional studio portrait photograph of this exact person. Warm beige cream background, soft warm studio lighting, friendly approachable style, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },

  // === ARTISTIC ===
  "artistic-dramatic": {
    name: "Dramatic Side Light",
    prompt: "Artistic portrait photograph of this exact person. Dark moody background, dramatic side lighting creating depth and shadows, artistic portrait style, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },
  "artistic-soft": {
    name: "Soft Glow",
    prompt: "Artistic portrait photograph of this exact person. Soft ethereal background, gentle glowing light surrounding the subject, dreamy artistic quality, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },
  "artistic-warm": {
    name: "Warm Tones",
    prompt: "Artistic portrait photograph of this exact person. Rich warm golden and amber tones throughout, beautiful warm lighting, cozy artistic atmosphere, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },

  // === LEGACY STYLES (for backward compatibility) ===
  "studio-gray": {
    name: "Studio Gray",
    prompt: "Professional studio portrait photograph of this exact person. Neutral gray gradient background, soft professional lighting, corporate style, sharp focus on face, maintain exact facial features and likeness, high resolution",
  },
};

// Helper to download image and upload to Supabase
async function saveImageToStorage(
  imageUrl: string,
  orderId: string,
  style: string,
  variant: number,
  supabase: ReturnType<typeof createAdminSupabaseClient>
): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const imageBuffer = await response.arrayBuffer();
  const fileName = `${uuidv4()}-${style}-v${variant}.jpg`;
  const filePath = `generated/${orderId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("headshots")
    .upload(filePath, imageBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Failed to upload image to storage");
  }

  const { data: urlData } = supabase.storage
    .from("headshots")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, imageUrl, styleId, quality = "standard", variant = 1 } = await request.json();

    if (!orderId || !imageUrl || !styleId) {
      return NextResponse.json(
        { error: "Missing orderId, imageUrl, or styleId" },
        { status: 400 }
      );
    }

    const styleConfig = HEADSHOT_STYLES[styleId];
    if (!styleConfig) {
      return NextResponse.json(
        { error: `Unknown style: ${styleId}` },
        { status: 400 }
      );
    }

    // Get real order ID from stripe session
    const order = await getOrderByStripeSession(orderId);
    const realOrderId = order?.id || orderId;

    console.log(`Generating ${styleConfig.name} (variant ${variant}) for order ${realOrderId}...`);

    // Use different models based on quality tier
    const model = quality === "premium"
      ? "black-forest-labs/flux-kontext-max" as const
      : "black-forest-labs/flux-kontext-pro" as const;

    // Add slight variation to prompt for multiple variants of same style
    let prompt = styleConfig.prompt;
    if (variant > 1) {
      const variations = [
        ", with subtle expression change",
        ", slight angle variation",
        ", minor lighting shift",
        ", gentle pose adjustment",
      ];
      prompt += variations[(variant - 2) % variations.length];
    }

    const output = await replicate.run(model, {
      input: {
        prompt,
        input_image: imageUrl,
        aspect_ratio: "3:4",
        output_format: "jpg",
        safety_tolerance: 2,
      },
    });

    const generatedUrl = Array.isArray(output) ? output[0] : output;

    if (!generatedUrl) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    // Save to Supabase storage
    const supabase = createAdminSupabaseClient();
    const permanentUrl = await saveImageToStorage(
      generatedUrl as string,
      realOrderId,
      styleId,
      variant,
      supabase
    );

    // Save to database
    await supabase.from("generated_images").insert({
      order_id: realOrderId,
      image_url: permanentUrl,
      style: styleId,
      style_name: variant > 1 ? `${styleConfig.name} #${variant}` : styleConfig.name,
      quality,
      created_at: new Date().toISOString(),
    });

    console.log(`Completed ${styleConfig.name} variant ${variant}`);

    return NextResponse.json({
      success: true,
      image: {
        id: `${styleId}-${variant}-${Date.now()}`,
        style: styleId,
        styleName: variant > 1 ? `${styleConfig.name} #${variant}` : styleConfig.name,
        imageUrl: permanentUrl,
        quality,
        variant,
      },
    });
  } catch (error) {
    console.error("Single generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate headshot" },
      { status: 500 }
    );
  }
}
