import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Expanded professional headshot styles - 10 base styles with variations
const HEADSHOT_STYLES = [
  // Corporate styles
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    prompt: "Transform this into a professional corporate headshot. Clean white background, soft studio lighting, wearing a navy blue suit with white shirt, LinkedIn profile photo style, high resolution, sharp focus on face",
  },
  {
    id: "corporate-gray",
    name: "Corporate Gray",
    prompt: "Transform this into a professional corporate headshot. Clean white background, soft studio lighting, wearing a charcoal gray suit, professional business portrait, high resolution, sharp focus",
  },
  {
    id: "corporate-black",
    name: "Corporate Classic",
    prompt: "Transform this into a professional corporate headshot. Gradient gray background, studio lighting, wearing a black suit with crisp white shirt, executive portrait style, high resolution",
  },
  // Business casual styles
  {
    id: "business-casual-blue",
    name: "Business Casual Blue",
    prompt: "Transform this into a professional headshot. Soft gray background, natural lighting, wearing a light blue button-up shirt, friendly approachable expression, modern professional look",
  },
  {
    id: "business-casual-white",
    name: "Business Casual White",
    prompt: "Transform this into a professional headshot. Soft neutral background, natural lighting, wearing a crisp white shirt, open collar, relaxed professional style, approachable",
  },
  {
    id: "business-casual-polo",
    name: "Smart Casual",
    prompt: "Transform this into a professional headshot. Light gray background, soft lighting, wearing a navy polo shirt, smart casual business style, friendly and professional",
  },
  // Creative styles
  {
    id: "creative-turtleneck",
    name: "Creative Professional",
    prompt: "Transform this into a stylish professional headshot. Minimalist white background, dramatic studio lighting, wearing a black turtleneck, creative industry style, designer aesthetic",
  },
  {
    id: "creative-modern",
    name: "Modern Creative",
    prompt: "Transform this into a modern professional headshot. Clean white background, soft artistic lighting, wearing a dark sweater, contemporary creative professional look",
  },
  // Outdoor/natural styles
  {
    id: "outdoor-natural",
    name: "Natural Light",
    prompt: "Transform this into a professional outdoor headshot. Natural greenery background with soft bokeh, golden hour lighting, warm natural tones, approachable and friendly expression",
  },
  {
    id: "outdoor-urban",
    name: "Urban Professional",
    prompt: "Transform this into a professional urban headshot. Blurred city background, natural daylight, wearing smart casual attire, modern urban professional style",
  },
  // Executive styles
  {
    id: "executive-classic",
    name: "Executive Classic",
    prompt: "Transform this into an executive headshot. Gradient gray background, premium studio lighting, wearing a black suit with white shirt, CEO portrait style, authoritative yet approachable",
  },
  {
    id: "executive-modern",
    name: "Executive Modern",
    prompt: "Transform this into a modern executive headshot. Dark gradient background, dramatic lighting, wearing a dark suit, contemporary C-suite portrait, confident expression",
  },
  // Tech/startup styles
  {
    id: "tech-startup",
    name: "Tech Startup",
    prompt: "Transform this into a tech startup headshot. Clean minimal background, bright modern lighting, wearing a casual hoodie or t-shirt, Silicon Valley style, innovative and approachable",
  },
  {
    id: "tech-professional",
    name: "Tech Professional",
    prompt: "Transform this into a tech professional headshot. Simple gray background, clean lighting, wearing a casual button-up shirt, modern tech industry style",
  },
  // Healthcare/professional services
  {
    id: "healthcare-professional",
    name: "Healthcare Professional",
    prompt: "Transform this into a healthcare professional headshot. Clean white background, bright even lighting, wearing professional attire, trustworthy and caring expression, medical professional style",
  },
  // Academic/education
  {
    id: "academic",
    name: "Academic Professional",
    prompt: "Transform this into an academic professional headshot. Library or office background with soft bokeh, warm lighting, wearing smart casual or blazer, scholarly and approachable",
  },
  // Real estate/sales
  {
    id: "sales-professional",
    name: "Sales Professional",
    prompt: "Transform this into a sales professional headshot. Clean bright background, confident lighting, wearing professional business attire, warm smile, trustworthy and personable",
  },
  // Finance
  {
    id: "finance-professional",
    name: "Finance Professional",
    prompt: "Transform this into a finance professional headshot. Conservative gray background, professional lighting, wearing a formal suit, confident and trustworthy expression",
  },
  // Legal
  {
    id: "legal-professional",
    name: "Legal Professional",
    prompt: "Transform this into a legal professional headshot. Traditional office background, formal lighting, wearing a dark suit, authoritative and professional demeanor",
  },
  // Consulting
  {
    id: "consultant",
    name: "Consultant",
    prompt: "Transform this into a consultant headshot. Modern office background, professional lighting, wearing business professional attire, confident and knowledgeable expression",
  },
];

export interface GenerationResult {
  id: string;
  style: string;
  styleName: string;
  imageUrl: string;
  quality: "standard" | "premium";
}

// Get styles based on tier
export function getStylesForTier(tier: string): typeof HEADSHOT_STYLES {
  switch (tier) {
    case "premium":
      return HEADSHOT_STYLES; // All 20 styles
    case "pro":
      return HEADSHOT_STYLES.slice(0, 16); // 16 styles
    case "basic":
    default:
      return HEADSHOT_STYLES.slice(0, 10); // 10 styles
  }
}

// Generate instant headshots using Replicate's FLUX Kontext
export async function generateInstantHeadshots(
  inputImageUrl: string,
  styles: string[] = ["corporate-navy", "business-casual-blue", "creative-turtleneck"],
  quality: "standard" | "premium" = "standard"
): Promise<GenerationResult[]> {
  const selectedStyles = HEADSHOT_STYLES.filter((s) => styles.includes(s.id));

  // Use different models based on quality tier
  const model = quality === "premium"
    ? "black-forest-labs/flux-kontext-max" as const
    : "black-forest-labs/flux-kontext-pro" as const;

  const results: GenerationResult[] = [];

  // Generate headshots sequentially to avoid rate limits
  for (const style of selectedStyles) {
    try {
      console.log(`Generating ${style.name}...`);

      const output = await replicate.run(model, {
        input: {
          prompt: style.prompt,
          input_image: inputImageUrl,
          aspect_ratio: "3:4",
          output_format: "jpg",
          safety_tolerance: 2,
        },
      });

      const imageUrl = Array.isArray(output) ? output[0] : output;

      results.push({
        id: `${style.id}-${Date.now()}`,
        style: style.id,
        styleName: style.name,
        imageUrl: imageUrl as string,
        quality,
      });

      console.log(`Completed ${style.name}`);

      // Small delay between requests to respect rate limits
      if (selectedStyles.indexOf(style) < selectedStyles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Failed to generate ${style.name}:`, error);
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
        input_image: inputImageUrl,
        aspect_ratio: "3:4",
        output_format: "png",
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
