import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Professional headshot prompts for instant generation
const HEADSHOT_STYLES = [
  {
    id: "corporate",
    name: "Corporate Professional",
    prompt: "Transform this into a professional corporate headshot. Clean white background, soft studio lighting, wearing a navy blue suit, LinkedIn profile photo style, high resolution, sharp focus",
  },
  {
    id: "business-casual",
    name: "Business Casual",
    prompt: "Transform this into a professional headshot. Soft gray background, natural lighting, wearing a light blue button-up shirt, friendly approachable expression, modern professional look",
  },
  {
    id: "creative",
    name: "Creative Professional",
    prompt: "Transform this into a stylish professional headshot. Minimalist white background, dramatic studio lighting, wearing a black turtleneck, creative industry style, designer aesthetic",
  },
  {
    id: "outdoor",
    name: "Natural Light",
    prompt: "Transform this into a professional outdoor headshot. Natural greenery background with soft bokeh, golden hour lighting, warm natural tones, approachable and friendly",
  },
  {
    id: "executive",
    name: "Executive",
    prompt: "Transform this into an executive headshot. Gradient gray background, studio lighting, wearing a black suit with white shirt, CEO portrait style, authoritative yet approachable",
  },
];

export interface GenerationResult {
  id: string;
  style: string;
  styleName: string;
  imageUrl: string;
  quality: "standard" | "premium";
}

// Generate instant headshots using Replicate's FLUX Kontext
export async function generateInstantHeadshots(
  inputImageUrl: string,
  styles: string[] = ["corporate", "business-casual", "creative"],
  quality: "standard" | "premium" = "standard"
): Promise<GenerationResult[]> {
  const selectedStyles = HEADSHOT_STYLES.filter((s) => styles.includes(s.id));

  // Use different models based on quality tier
  const model = quality === "premium"
    ? "black-forest-labs/flux-kontext-max" as const
    : "black-forest-labs/flux-kontext-pro" as const;

  const results: GenerationResult[] = [];

  // Generate headshots in parallel for speed
  const promises = selectedStyles.map(async (style) => {
    try {
      const output = await replicate.run(model, {
        input: {
          prompt: style.prompt,
          image: inputImageUrl,
          aspect_ratio: "3:4",
          output_format: "webp",
          output_quality: 90,
          safety_tolerance: 2,
        },
      });

      // Output is typically an array with the image URL
      const imageUrl = Array.isArray(output) ? output[0] : output;

      return {
        id: `${style.id}-${Date.now()}`,
        style: style.id,
        styleName: style.name,
        imageUrl: imageUrl as string,
        quality,
      };
    } catch (error) {
      console.error(`Failed to generate ${style.name}:`, error);
      return null;
    }
  });

  const outputs = await Promise.all(promises);

  for (const output of outputs) {
    if (output) {
      results.push(output);
    }
  }

  return results;
}

// Generate premium quality headshots (for upsell)
export async function regeneratePremium(
  inputImageUrl: string,
  style: string
): Promise<GenerationResult | null> {
  const styleConfig = HEADSHOT_STYLES.find((s) => s.id === style);
  if (!styleConfig) return null;

  try {
    // Use the max model for premium quality
    const output = await replicate.run("black-forest-labs/flux-kontext-max", {
      input: {
        prompt: styleConfig.prompt + ", ultra high quality, 8K resolution, extremely detailed",
        image: inputImageUrl,
        aspect_ratio: "3:4",
        output_format: "png",
        output_quality: 100,
        safety_tolerance: 2,
      },
    });

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return {
      id: `${style}-premium-${Date.now()}`,
      style: style,
      styleName: styleConfig.name + " (Premium)",
      imageUrl: imageUrl as string,
      quality: "premium",
    };
  } catch (error) {
    console.error("Premium generation failed:", error);
    return null;
  }
}

// Get all available styles
export function getAvailableStyles() {
  return HEADSHOT_STYLES.map((s) => ({
    id: s.id,
    name: s.name,
  }));
}

export { HEADSHOT_STYLES };
