import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";

// Demo order ID for testing - skip generation and return existing images
const DEMO_ORDER_ID = "cs_test_a10w4eDn4CKk4FR9IgZh6bhHoaQpgMVuXjLs35oUdR6xC6wnA96VUPLTUP";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  // Only allow demo images for the specific demo order
  if (orderId !== DEMO_ORDER_ID) {
    return NextResponse.json({ error: "Not a demo order" }, { status: 403 });
  }

  try {
    const supabase = createAdminSupabaseClient();

    // Get the real order ID from stripe session ID
    const order = await getOrderByStripeSession(orderId);
    const realOrderId = order?.id || orderId;

    console.log(`Fetching demo images for order: ${realOrderId} (stripe session: ${orderId})`);

    // Fetch existing generated images for this order
    const { data: images, error } = await supabase
      .from("generated_images")
      .select("*")
      .eq("order_id", realOrderId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching demo images:", error);
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }

    // Transform to expected format
    const formattedImages = (images || []).map((img, index) => ({
      id: img.id || `demo-${index}`,
      style: img.style || "unknown",
      styleName: img.style_name || img.style || "Style",
      imageUrl: img.image_url,
      quality: img.quality || "standard",
    }));

    return NextResponse.json({
      success: true,
      images: formattedImages,
      count: formattedImages.length,
    });
  } catch (error) {
    console.error("Demo images error:", error);
    return NextResponse.json({ error: "Failed to load demo images" }, { status: 500 });
  }
}
