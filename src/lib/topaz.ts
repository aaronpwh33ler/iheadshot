// Topaz Labs Image API for upscaling
// Documentation: https://developer.topazlabs.com/image-api/introduction
// Using Standard V2 model with face enhancement for best headshot results

const TOPAZ_API_URL = "https://api.topazlabs.com/image/v1/enhance";
const TOPAZ_API_KEY = process.env.TOPAZ_API_KEY;

export interface UpscaleResult {
  id: string;
  originalUrl: string;
  upscaledUrl: string;
  scale: number;
  width: number;
  height: number;
}

export interface UpscaleOptions {
  scale?: 2 | 4 | 8; // Upscale factor (converted to output_width)
  outputFormat?: "jpeg" | "png" | "webp";
  faceEnhancement?: boolean;
  faceEnhancementCreativity?: number; // 0-1, lower = more faithful
}

// Download image and convert to blob
async function fetchImageAsBlob(imageUrl: string): Promise<Blob> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}

// Upload upscaled image to Supabase and return URL
async function uploadToSupabase(
  imageBlob: Blob,
  orderId: string,
  originalUrl: string
): Promise<string> {
  const { createAdminSupabaseClient } = await import("@/lib/supabase");
  const supabase = createAdminSupabaseClient();

  // Generate unique filename
  const timestamp = Date.now();
  const extension = imageBlob.type.includes("png") ? "png" : imageBlob.type.includes("webp") ? "webp" : "jpg";
  const filename = `${orderId}/upscaled-${timestamp}.${extension}`;

  // Convert blob to buffer for upload
  const arrayBuffer = await imageBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from("headshots")
    .upload(`generated/${filename}`, buffer, {
      contentType: imageBlob.type,
      upsert: true,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(`Failed to upload upscaled image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("headshots")
    .getPublicUrl(`generated/${filename}`);

  return urlData.publicUrl;
}

// Upscale an image using Topaz Labs Image API
export async function upscaleWithBloom(
  imageUrl: string,
  options: UpscaleOptions = {}
): Promise<UpscaleResult | null> {
  const {
    scale = 4,
    outputFormat = "png",
    faceEnhancement = true,
    faceEnhancementCreativity = 0, // Low creativity for faithful upscaling
  } = options;

  if (!TOPAZ_API_KEY) {
    console.error("TOPAZ_API_KEY not configured");
    throw new Error("Upscaling service not configured");
  }

  try {
    console.log(`Starting Topaz upscale: ${scale}x, format=${outputFormat}`);

    // Fetch the original image
    const imageBlob = await fetchImageAsBlob(imageUrl);

    // Calculate output width based on scale
    // Assuming input is ~720p (1280x720), 4x would be 5120 (close to 4K)
    // Max output is 24MP (e.g., 6000x4000)
    const outputWidth = scale === 2 ? 2560 : scale === 4 ? 5120 : 7680;

    // Create form data for multipart request
    const formData = new FormData();
    formData.append("image", imageBlob, "image.jpg");
    formData.append("model", "Standard V2");
    formData.append("output_width", outputWidth.toString());
    formData.append("output_format", outputFormat);
    formData.append("subject_detection", "Foreground");
    formData.append("face_enhancement", faceEnhancement.toString());
    formData.append("face_enhancement_creativity", faceEnhancementCreativity.toString());
    formData.append("face_enhancement_strength", "0.8");

    // Make API request
    const response = await fetch(TOPAZ_API_URL, {
      method: "POST",
      headers: {
        "X-API-Key": TOPAZ_API_KEY,
        "accept": `image/${outputFormat}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Topaz API error:", response.status, errorText);
      throw new Error(`Upscale failed: ${response.status} - ${errorText}`);
    }

    // Get the upscaled image as blob
    const upscaledBlob = await response.blob();

    // Extract dimensions from response headers if available
    const width = parseInt(response.headers.get("x-output-width") || outputWidth.toString());
    const height = parseInt(response.headers.get("x-output-height") || "0");

    console.log(`Topaz upscale complete: ${width}x${height || "auto"}`);

    // Upload to Supabase and get permanent URL
    // For now, create a data URL (will need to implement proper storage)
    const upscaledUrl = await uploadToSupabase(upscaledBlob, "upscaled", imageUrl);

    return {
      id: `upscale-${Date.now()}`,
      originalUrl: imageUrl,
      upscaledUrl,
      scale,
      width,
      height: height || Math.round(width * 1.33), // Estimate if not provided
    };
  } catch (error) {
    console.error("Upscale error:", error);
    return null;
  }
}

// Batch upscale multiple images
export async function batchUpscale(
  imageUrls: string[],
  options: UpscaleOptions = {}
): Promise<UpscaleResult[]> {
  const results: UpscaleResult[] = [];

  // Process sequentially to avoid rate limits
  for (const url of imageUrls) {
    try {
      const result = await upscaleWithBloom(url, options);
      if (result) {
        results.push(result);
      }
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to upscale ${url}:`, error);
    }
  }

  return results;
}

// Calculate upscale pricing (client-side display only)
export function calculateUpscalePrice(imageCount: number, scale: 2 | 4 | 8): number {
  // Pricing per image based on scale factor
  const pricePerImage = {
    2: 0.50, // 2x upscale
    4: 1.00, // 4x upscale
    8: 2.00, // 8x upscale
  };

  return imageCount * pricePerImage[scale];
}
