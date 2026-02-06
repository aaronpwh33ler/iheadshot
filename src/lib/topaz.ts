// Topaz Labs Image API for upscaling
// Documentation: https://developer.topazlabs.com/image-api/introduction
// Strategy: 2x AI upscale with Topaz, then resize to 4K for best quality/speed balance

import sharp from "sharp";

const TOPAZ_API_URL = "https://api.topazlabs.com/image/v1/enhance";
const TOPAZ_API_KEY = process.env.TOPAZ_API_KEY;

// Target 4K dimensions (portrait orientation for headshots)
const TARGET_4K_WIDTH = 2880; // 4K portrait width
const TARGET_4K_HEIGHT = 3840; // 4K portrait height

export interface UpscaleResult {
  id: string;
  originalUrl: string;
  upscaledUrl: string;
  scale: number;
  width: number;
  height: number;
}

export interface UpscaleOptions {
  scale?: 2 | 4 | 8; // Displayed scale (actual AI upscale is 2x then resize)
  outputFormat?: "jpeg" | "png" | "webp";
  faceEnhancement?: boolean;
  faceEnhancementCreativity?: number; // 0-1, lower = more faithful
  orderId?: string; // For organizing uploads in Supabase
}

// Download image and convert to buffer
async function fetchImageAsBuffer(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Download image as Blob for FormData
async function fetchImageAsBlob(imageUrl: string): Promise<Blob> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}

// Resize image to 4K dimensions using sharp
async function resizeTo4K(imageBuffer: Buffer, outputFormat: "jpeg" | "png" | "webp"): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  // Calculate target dimensions maintaining aspect ratio
  const aspectRatio = (metadata.width || 1) / (metadata.height || 1);

  let targetWidth: number;
  let targetHeight: number;

  if (aspectRatio < 1) {
    // Portrait - fit to height
    targetHeight = TARGET_4K_HEIGHT;
    targetWidth = Math.round(targetHeight * aspectRatio);
  } else {
    // Landscape or square - fit to width
    targetWidth = TARGET_4K_WIDTH;
    targetHeight = Math.round(targetWidth / aspectRatio);
  }

  // Resize with high quality settings
  let resized = image.resize(targetWidth, targetHeight, {
    kernel: sharp.kernel.lanczos3, // High quality resampling
    withoutEnlargement: false, // Allow enlargement
  });

  // Output in specified format with high quality
  if (outputFormat === "jpeg") {
    resized = resized.jpeg({ quality: 95, mozjpeg: true });
  } else if (outputFormat === "png") {
    resized = resized.png({ compressionLevel: 6 });
  } else {
    resized = resized.webp({ quality: 95 });
  }

  return await resized.toBuffer();
}

// Upload upscaled image to Supabase and return URL
async function uploadToSupabase(
  imageBuffer: Buffer,
  orderId: string,
  originalUrl: string,
  contentType: string
): Promise<string> {
  const { createAdminSupabaseClient } = await import("@/lib/supabase");
  const supabase = createAdminSupabaseClient();

  // Generate unique filename
  const timestamp = Date.now();
  const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const filename = `${orderId}/upscaled-4k-${timestamp}.${extension}`;

  const { data, error } = await supabase.storage
    .from("headshots")
    .upload(`generated/${filename}`, imageBuffer, {
      contentType,
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

// Upscale an image using Topaz Labs Image API (2x) then resize to 4K
export async function upscaleWithBloom(
  imageUrl: string,
  options: UpscaleOptions = {}
): Promise<UpscaleResult> {
  const {
    scale = 4, // Display scale (we actually do 2x AI + resize)
    outputFormat = "jpeg",
    faceEnhancement = true,
    faceEnhancementCreativity = 0, // Low creativity for faithful upscaling
    orderId = "upscaled",
  } = options;

  if (!TOPAZ_API_KEY) {
    console.error("TOPAZ_API_KEY not configured");
    throw new Error("Upscaling service not configured");
  }

  try {
    console.log(`Starting Topaz upscale: 2x AI + resize to 4K, format=${outputFormat}`);

    // Step 1: Fetch the original image as Blob for FormData
    const imageBlob = await fetchImageAsBlob(imageUrl);

    // Step 2: Call Topaz API for 2x upscale (faster, better quality, uses 1 credit)
    // 2x from ~720p gives us ~1440p, which we then resize to 4K
    const outputWidth = 2560; // 2x from typical 1280 input

    const formData = new FormData();
    formData.append("image", imageBlob, "image.jpg");
    formData.append("model", "Upscale Standard"); // Standard upscaling model
    formData.append("output_width", outputWidth.toString());
    formData.append("output_format", outputFormat);

    console.log("Calling Topaz API for 2x AI enhancement...");

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

      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your TOPAZ_API_KEY.");
      } else if (response.status === 402 || errorText.includes("credit") || errorText.includes("balance")) {
        throw new Error("Insufficient credits. Please add credits at topazlabs.com/api");
      } else if (response.status === 429) {
        throw new Error("Rate limited. Please wait and try again.");
      }

      throw new Error(`Upscale failed: ${response.status} - ${errorText}`);
    }

    // Step 3: Get the 2x upscaled image
    const upscaledArrayBuffer = await response.arrayBuffer();
    const upscaled2xBuffer = Buffer.from(upscaledArrayBuffer);

    console.log(`Topaz 2x upscale complete. Resizing to 4K...`);

    // Step 4: Resize to full 4K using sharp (lanczos3 for quality)
    const final4kBuffer = await resizeTo4K(upscaled2xBuffer, outputFormat);

    // Get final dimensions
    const finalMetadata = await sharp(final4kBuffer).metadata();
    const finalWidth = finalMetadata.width || TARGET_4K_WIDTH;
    const finalHeight = finalMetadata.height || TARGET_4K_HEIGHT;

    console.log(`4K resize complete: ${finalWidth}x${finalHeight}`);

    // Step 5: Upload to Supabase
    console.log(`Uploading 4K image to Supabase for order: ${orderId}`);
    const contentType = outputFormat === "png" ? "image/png" : outputFormat === "webp" ? "image/webp" : "image/jpeg";
    const upscaledUrl = await uploadToSupabase(final4kBuffer, orderId, imageUrl, contentType);
    console.log(`Upload complete: ${upscaledUrl}`);

    return {
      id: `upscale-${Date.now()}`,
      originalUrl: imageUrl,
      upscaledUrl,
      scale, // Report the display scale (4x)
      width: finalWidth,
      height: finalHeight,
    };
  } catch (error) {
    console.error("Upscale error:", error);
    throw error;
  }
}

// Batch upscale multiple images
export async function batchUpscale(
  imageUrls: string[],
  options: UpscaleOptions = {}
): Promise<UpscaleResult[]> {
  const results: UpscaleResult[] = [];
  const errors: string[] = [];

  // Process sequentially to avoid rate limits
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    try {
      console.log(`Upscaling image ${i + 1}/${imageUrls.length}`);
      const result = await upscaleWithBloom(url, options);
      results.push(result);
      // Small delay between requests
      if (i < imageUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to upscale image ${i + 1}:`, errorMsg);
      errors.push(errorMsg);
    }
  }

  // If all failed, throw the first error
  if (results.length === 0 && errors.length > 0) {
    throw new Error(errors[0]);
  }

  return results;
}

// Calculate upscale pricing (client-side display only)
export function calculateUpscalePrice(imageCount: number, scale: 2 | 4 | 8): number {
  // Pricing per image based on scale factor
  const pricePerImage = {
    2: 0.50, // 2x upscale
    4: 1.00, // 4x upscale (actually 2x AI + resize)
    8: 2.00, // 8x upscale
  };

  return imageCount * pricePerImage[scale];
}
