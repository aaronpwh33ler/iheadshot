import { NextRequest, NextResponse } from "next/server";
import { generateInstantHeadshots, getAvailableStyles } from "@/lib/replicate";
import { createAdminSupabaseClient, updateOrderStatus, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Helper to download image and upload to Supabase
async function saveImageToStorage(
  imageUrl: string,
  orderId: string,
  style: string,
  supabase: ReturnType<typeof createAdminSupabaseClient>
): Promise<string> {
  // Download image from Replicate
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const imageBuffer = await response.arrayBuffer();
  const fileName = `${uuidv4()}-${style}.jpg`;
  const filePath = `generated/${orderId}/${fileName}`;

  // Upload to Supabase storage
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

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("headshots")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, imageUrl, styles, quality = "standard" } = await request.json();

    if (!orderId || !imageUrl) {
      return NextResponse.json(
        { error: "Missing orderId or imageUrl" },
        { status: 400 }
      );
    }

    // Get the real order ID from stripe session
    const order = await getOrderByStripeSession(orderId);
    const realOrderId = order?.id || orderId;

    // Default to 5 most popular styles if none specified
    const selectedStyles = styles || ["corporate", "business-casual", "creative", "outdoor", "executive"];

    console.log(`Starting instant generation for order ${realOrderId} with ${selectedStyles.length} styles`);

    // Generate headshots instantly (no training!)
    const results = await generateInstantHeadshots(imageUrl, selectedStyles, quality);

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate any headshots" },
        { status: 500 }
      );
    }

    // Save images to Supabase storage and update URLs
    const supabase = createAdminSupabaseClient();
    const savedResults = [];

    for (const result of results) {
      try {
        console.log(`Saving ${result.styleName} to storage...`);
        const permanentUrl = await saveImageToStorage(
          result.imageUrl,
          realOrderId,
          result.style,
          supabase
        );

        savedResults.push({
          ...result,
          imageUrl: permanentUrl,
        });

        // Save to database
        await supabase.from("generated_images").insert({
          order_id: realOrderId,
          image_url: permanentUrl,
          style: result.style,
          style_name: result.styleName,
          quality: result.quality,
          created_at: new Date().toISOString(),
        });

        console.log(`Saved ${result.styleName}`);
      } catch (saveError) {
        console.error(`Failed to save ${result.styleName}:`, saveError);
        // Still include with original URL as fallback
        savedResults.push(result);
      }
    }

    // Update order status to completed
    await updateOrderStatus(realOrderId, "completed");

    console.log(`Instant generation complete: ${savedResults.length} headshots saved`);

    return NextResponse.json({
      success: true,
      count: savedResults.length,
      images: savedResults,
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
