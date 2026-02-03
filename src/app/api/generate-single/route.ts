import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// All available headshot styles
const HEADSHOT_STYLES: Record<string, { name: string; prompt: string }> = {
  "corporate-navy": {
    name: "Corporate Navy",
    prompt: "Transform this into a professional corporate headshot. Clean white background, soft studio lighting, wearing a navy blue suit with white shirt, LinkedIn profile photo style, high resolution, sharp focus on face",
  },
  "corporate-gray": {
    name: "Corporate Gray",
    prompt: "Transform this into a professional corporate headshot. Clean white background, soft studio lighting, wearing a charcoal gray suit, professional business portrait, high resolution, sharp focus",
  },
  "corporate-black": {
    name: "Corporate Classic",
    prompt: "Transform this into a professional corporate headshot. Gradient gray background, studio lighting, wearing a black suit with crisp white shirt, executive portrait style, high resolution",
  },
  "business-casual-blue": {
    name: "Business Casual Blue",
    prompt: "Transform this into a professional headshot. Soft gray background, natural lighting, wearing a light blue button-up shirt, friendly approachable expression, modern professional look",
  },
  "business-casual-white": {
    name: "Business Casual White",
    prompt: "Transform this into a professional headshot. Soft neutral background, natural lighting, wearing a crisp white shirt, open collar, relaxed professional style, approachable",
  },
  "business-casual-polo": {
    name: "Smart Casual",
    prompt: "Transform this into a professional headshot. Light gray background, soft lighting, wearing a navy polo shirt, smart casual business style, friendly and professional",
  },
  "creative-turtleneck": {
    name: "Creative Professional",
    prompt: "Transform this into a stylish professional headshot. Minimalist white background, dramatic studio lighting, wearing a black turtleneck, creative industry style, designer aesthetic",
  },
  "creative-modern": {
    name: "Modern Creative",
    prompt: "Transform this into a modern professional headshot. Clean white background, soft artistic lighting, wearing a dark sweater, contemporary creative professional look",
  },
  "outdoor-natural": {
    name: "Natural Light",
    prompt: "Transform this into a professional outdoor headshot. Natural greenery background with soft bokeh, golden hour lighting, warm natural tones, approachable and friendly expression",
  },
  "outdoor-urban": {
    name: "Urban Professional",
    prompt: "Transform this into a professional urban headshot. Blurred city background, natural daylight, wearing smart casual attire, modern urban professional style",
  },
  "executive-classic": {
    name: "Executive Classic",
    prompt: "Transform this into an executive headshot. Gradient gray background, premium studio lighting, wearing a black suit with white shirt, CEO portrait style, authoritative yet approachable",
  },
  "executive-modern": {
    name: "Executive Modern",
    prompt: "Transform this into a modern executive headshot. Dark gradient background, dramatic lighting, wearing a dark suit, contemporary C-suite portrait, confident expression",
  },
  "tech-startup": {
    name: "Tech Startup",
    prompt: "Transform this into a tech startup headshot. Clean minimal background, bright modern lighting, wearing a casual hoodie or t-shirt, Silicon Valley style, innovative and approachable",
  },
  "tech-professional": {
    name: "Tech Professional",
    prompt: "Transform this into a tech professional headshot. Simple gray background, clean lighting, wearing a casual button-up shirt, modern tech industry style",
  },
  "healthcare-professional": {
    name: "Healthcare Professional",
    prompt: "Transform this into a healthcare professional headshot. Clean white background, bright even lighting, wearing professional attire, trustworthy and caring expression, medical professional style",
  },
  "academic": {
    name: "Academic Professional",
    prompt: "Transform this into an academic professional headshot. Library or office background with soft bokeh, warm lighting, wearing smart casual or blazer, scholarly and approachable",
  },
  "sales-professional": {
    name: "Sales Professional",
    prompt: "Transform this into a sales professional headshot. Clean bright background, confident lighting, wearing professional business attire, warm smile, trustworthy and personable",
  },
  "finance-professional": {
    name: "Finance Professional",
    prompt: "Transform this into a finance professional headshot. Conservative gray background, professional lighting, wearing a formal suit, confident and trustworthy expression",
  },
  "legal-professional": {
    name: "Legal Professional",
    prompt: "Transform this into a legal professional headshot. Traditional office background, formal lighting, wearing a dark suit, authoritative and professional demeanor",
  },
  "consultant": {
    name: "Consultant",
    prompt: "Transform this into a consultant headshot. Modern office background, professional lighting, wearing business professional attire, confident and knowledgeable expression",
  },
};

// Helper to download image and upload to Supabase
async function saveImageToStorage(
  imageUrl: string,
  orderId: string,
  style: string,
  supabase: ReturnType<typeof createAdminSupabaseClient>
): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const imageBuffer = await response.arrayBuffer();
  const fileName = `${uuidv4()}-${style}.jpg`;
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
    const { orderId, imageUrl, styleId, quality = "standard" } = await request.json();

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

    console.log(`Generating ${styleConfig.name} for order ${realOrderId}...`);

    // Use different models based on quality tier
    const model = quality === "premium"
      ? "black-forest-labs/flux-kontext-max" as const
      : "black-forest-labs/flux-kontext-pro" as const;

    const output = await replicate.run(model, {
      input: {
        prompt: styleConfig.prompt,
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
      supabase
    );

    // Save to database
    await supabase.from("generated_images").insert({
      order_id: realOrderId,
      image_url: permanentUrl,
      style: styleId,
      style_name: styleConfig.name,
      quality,
      created_at: new Date().toISOString(),
    });

    console.log(`Completed ${styleConfig.name}`);

    return NextResponse.json({
      success: true,
      image: {
        id: `${styleId}-${Date.now()}`,
        style: styleId,
        styleName: styleConfig.name,
        imageUrl: permanentUrl,
        quality,
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
