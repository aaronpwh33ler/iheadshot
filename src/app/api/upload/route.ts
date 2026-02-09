import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getOrderByStripeSession } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const stripeSessionId = formData.get("orderId") as string;

    if (!file || !stripeSessionId) {
      return NextResponse.json(
        { error: "Missing file or orderId" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (4MB max — Vercel serverless body limit is 4.5MB)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 4MB. Photos are compressed automatically — please try again." },
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

    // Generate unique file path using real order ID
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${order.id}/${fileName}`;

    // Convert File to ArrayBuffer then Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("headshots")
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("headshots")
      .getPublicUrl(filePath);

    // Save to uploads table with real order ID
    const { error: dbError } = await supabase.from("uploads").insert({
      order_id: order.id,
      file_path: filePath,
      file_name: file.name,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      // File uploaded but DB record failed - log but don't fail
    }

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
