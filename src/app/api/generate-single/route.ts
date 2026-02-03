import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// IMPROVED PROMPTS: Focus on background/lighting, preserve the person's likeness
// The key insight: prompts that work DON'T try to change clothing
const HEADSHOT_STYLES: Record<string, { name: string; prompt: string }> = {
  // === STUDIO BACKGROUNDS (clean, professional) ===
  "studio-white": {
    name: "Studio White",
    prompt: "Professional headshot portrait of this person. Clean pure white studio background, soft diffused lighting, sharp focus on face, high resolution professional photograph, maintain exact facial features and likeness",
  },
  "studio-gray": {
    name: "Studio Gray",
    prompt: "Professional headshot portrait of this person. Neutral gray gradient studio background, soft professional lighting, sharp focus on face, corporate portrait style, maintain exact facial features and likeness",
  },
  "studio-dark": {
    name: "Studio Dark",
    prompt: "Professional headshot portrait of this person. Dark charcoal gradient background, dramatic studio lighting with soft shadows, executive portrait style, sharp focus on face, maintain exact facial features and likeness",
  },
  "studio-warm": {
    name: "Studio Warm",
    prompt: "Professional headshot portrait of this person. Warm beige studio background, soft warm lighting, friendly approachable expression, sharp focus on face, maintain exact facial features and likeness",
  },

  // === OUTDOOR/NATURAL (these work best!) ===
  "outdoor-natural": {
    name: "Natural Light",
    prompt: "Professional outdoor headshot portrait of this person. Natural greenery background with soft bokeh, golden hour warm lighting, approachable friendly expression, sharp focus on face, maintain exact facial features and likeness",
  },
  "outdoor-urban": {
    name: "Urban Professional",
    prompt: "Professional urban headshot portrait of this person. Blurred city background with soft bokeh, natural daylight, modern professional style, sharp focus on face, maintain exact facial features and likeness",
  },
  "outdoor-park": {
    name: "Park Setting",
    prompt: "Professional outdoor headshot portrait of this person. Lush green park background with soft bokeh, dappled natural sunlight, warm and approachable, sharp focus on face, maintain exact facial features and likeness",
  },
  "outdoor-sunset": {
    name: "Golden Hour",
    prompt: "Professional outdoor headshot portrait of this person. Soft golden sunset background with warm bokeh, beautiful golden hour lighting, warm natural tones, sharp focus on face, maintain exact facial features and likeness",
  },

  // === OFFICE/BUSINESS ENVIRONMENTS ===
  "office-modern": {
    name: "Modern Office",
    prompt: "Professional headshot portrait of this person. Modern office background with soft bokeh, clean professional lighting, contemporary business setting, sharp focus on face, maintain exact facial features and likeness",
  },
  "office-executive": {
    name: "Executive Office",
    prompt: "Professional headshot portrait of this person. Elegant executive office background with soft bokeh, warm professional lighting, sophisticated business setting, sharp focus on face, maintain exact facial features and likeness",
  },
  "office-creative": {
    name: "Creative Space",
    prompt: "Professional headshot portrait of this person. Modern creative workspace background with soft bokeh, bright natural lighting, innovative professional setting, sharp focus on face, maintain exact facial features and likeness",
  },
  "office-library": {
    name: "Library/Study",
    prompt: "Professional headshot portrait of this person. Elegant library or study background with bookshelves in soft bokeh, warm ambient lighting, scholarly sophisticated setting, sharp focus on face, maintain exact facial features and likeness",
  },

  // === ARTISTIC/CREATIVE ===
  "artistic-minimal": {
    name: "Minimalist",
    prompt: "Professional minimalist headshot portrait of this person. Clean simple white background, soft even lighting, contemporary minimalist style, artistic portrait, sharp focus on face, maintain exact facial features and likeness",
  },
  "artistic-dramatic": {
    name: "Dramatic Light",
    prompt: "Professional dramatic headshot portrait of this person. Dark moody background, dramatic side lighting creating depth, artistic portrait style, sharp focus on face, maintain exact facial features and likeness",
  },
  "artistic-colorful": {
    name: "Vibrant Color",
    prompt: "Professional headshot portrait of this person. Soft colorful gradient background in warm tones, bright cheerful lighting, creative modern style, sharp focus on face, maintain exact facial features and likeness",
  },

  // === INDUSTRY-SPECIFIC (focus on background/setting, not clothes) ===
  "tech-modern": {
    name: "Tech Professional",
    prompt: "Professional headshot portrait of this person. Modern tech office background with soft bokeh, clean bright lighting, innovative Silicon Valley style, sharp focus on face, maintain exact facial features and likeness",
  },
  "healthcare-clean": {
    name: "Healthcare",
    prompt: "Professional headshot portrait of this person. Clean bright medical/healthcare setting background with soft bokeh, bright even lighting, trustworthy and caring expression, sharp focus on face, maintain exact facial features and likeness",
  },
  "finance-classic": {
    name: "Finance",
    prompt: "Professional headshot portrait of this person. Classic business environment background with soft bokeh, professional lighting, confident trustworthy expression, sharp focus on face, maintain exact facial features and likeness",
  },
  "consultant-pro": {
    name: "Consultant",
    prompt: "Professional headshot portrait of this person. Modern business environment background with soft bokeh, professional lighting, confident knowledgeable expression, sharp focus on face, maintain exact facial features and likeness",
  },
  "academic-scholar": {
    name: "Academic",
    prompt: "Professional headshot portrait of this person. Academic setting with library or campus background in soft bokeh, warm natural lighting, scholarly approachable expression, sharp focus on face, maintain exact facial features and likeness",
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
        ", slightly different angle",
        ", subtle expression variation",
        ", minor lighting adjustment",
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
