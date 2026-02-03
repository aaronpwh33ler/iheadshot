// Topaz Labs Bloom API for upscaling
// Documentation: https://developer.topazlabs.com/premium-models/bloom

const TOPAZ_API_URL = "https://api.topazlabs.com/v1";
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
  scale?: 2 | 4 | 8; // Upscale factor
  creativity?: number; // 0-10, higher = more AI enhancement
  outputFormat?: "png" | "jpg" | "webp";
}

// Upscale an image using Topaz Bloom
export async function upscaleWithBloom(
  imageUrl: string,
  options: UpscaleOptions = {}
): Promise<UpscaleResult | null> {
  const { scale = 4, creativity = 5, outputFormat = "png" } = options;

  if (!TOPAZ_API_KEY) {
    console.error("TOPAZ_API_KEY not configured");
    throw new Error("Upscaling service not configured");
  }

  try {
    // Start the upscale job
    const response = await fetch(`${TOPAZ_API_URL}/bloom/upscale`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOPAZ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        scale_factor: scale,
        creativity: creativity,
        output_format: outputFormat,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Topaz API error:", error);
      throw new Error(`Upscale failed: ${error}`);
    }

    const result = await response.json();

    return {
      id: result.id || `upscale-${Date.now()}`,
      originalUrl: imageUrl,
      upscaledUrl: result.output_url || result.url,
      scale,
      width: result.width,
      height: result.height,
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

  // Process in parallel but limit concurrency
  const batchSize = 3;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((url) => upscaleWithBloom(url, options))
    );

    for (const result of batchResults) {
      if (result) {
        results.push(result);
      }
    }
  }

  return results;
}

// Calculate upscale pricing
export function calculateUpscalePrice(imageCount: number, scale: 2 | 4 | 8): number {
  // Pricing per image based on scale factor
  const pricePerImage = {
    2: 0.50, // 2x upscale
    4: 1.00, // 4x upscale
    8: 2.00, // 8x upscale
  };

  return imageCount * pricePerImage[scale];
}
