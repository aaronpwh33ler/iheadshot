import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, Order } from "@/lib/supabase";

interface LookupRequest {
  email: string;
}

interface OrderResponse {
  id: string;
  tier: Order["tier"];
  status: Order["status"];
  headshot_count: number;
  images_generated: number;
  created_at: string;
}

interface LookupResponse {
  orders: OrderResponse[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: LookupRequest = await request.json();
    const { email } = body;

    // Validate email input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Get all orders for this email
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, tier, status, headshot_count, created_at")
      .eq("email", email.toLowerCase())
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    // If no orders found, return empty array
    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    // Get image counts for each order
    const orderIds = orders.map((o) => o.id);
    const { data: imageCounts, error: imagesError } = await supabase
      .from("generated_images")
      .select("order_id")
      .in("order_id", orderIds);

    if (imagesError) {
      console.error("Error fetching image counts:", imagesError);
      return NextResponse.json(
        { error: "Failed to fetch order details" },
        { status: 500 }
      );
    }

    // Count images per order
    const imageCountMap: Record<string, number> = {};
    imageCounts?.forEach((img) => {
      imageCountMap[img.order_id] = (imageCountMap[img.order_id] || 0) + 1;
    });

    // Build response with sanitized data
    const responseOrders: OrderResponse[] = orders.map((order) => ({
      id: order.id,
      tier: order.tier,
      status: order.status,
      headshot_count: order.headshot_count,
      images_generated: imageCountMap[order.id] || 0,
      created_at: order.created_at,
    }));

    const response: LookupResponse = {
      orders: responseOrders,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
