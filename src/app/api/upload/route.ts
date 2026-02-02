import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const orderId = formData.get("orderId") as string;

    if (!file || !orderId) {
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

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Generate unique file path
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${orderId}/${fileName}`;

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

    // Save to uploads table
    const { error: dbError } = await supabase.from("uploads").insert({
      order_id: orderId,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
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
