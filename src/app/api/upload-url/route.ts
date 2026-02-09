import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Returns a signed upload URL so the client can upload directly to Supabase Storage,
// bypassing Vercel's serverless body size limit entirely.
export async function POST(request: NextRequest) {
  try {
    const { orderId: stripeSessionId, fileName, contentType } = await request.json();

    if (!stripeSessionId || !fileName) {
      return NextResponse.json(
        { error: "Missing orderId or fileName" },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (contentType && !allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Look up the real order by stripe session ID
    const order = await getOrderByStripeSession(stripeSessionId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please ensure payment was completed." },
        { status: 404 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Generate unique file path
    const fileExtension = fileName.split(".").pop() || "jpg";
    const uniqueName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${order.id}/${uniqueName}`;

    // Create signed upload URL (valid for 2 minutes)
    const { data, error } = await supabase.storage
      .from("headshots")
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      console.error("Failed to create signed upload URL:", error);
      return NextResponse.json(
        { error: "Failed to create upload URL" },
        { status: 500 }
      );
    }

    // Get the public URL for this path (for later use)
    const { data: urlData } = supabase.storage
      .from("headshots")
      .getPublicUrl(filePath);

    // Save to uploads table
    const { error: dbError } = await supabase.from("uploads").insert({
      order_id: order.id,
      file_path: filePath,
      file_name: fileName,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      // Non-blocking — file path is still valid
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: filePath,
      publicUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Upload URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
