import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Professional headshot styles with FULL VARIETY - different poses, outfits, backgrounds
// These prompts generate NEW images (not transform the input) while preserving identity
const HEADSHOT_STYLES = [
  // Corporate styles - different poses and compositions
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    prompt: "Professional corporate headshot photo of a person, wearing a tailored navy blue suit with white dress shirt, clean white studio background, soft professional lighting, slight smile, looking directly at camera, shoulders at slight angle, LinkedIn profile photo style, photorealistic, high resolution",
  },
  {
    id: "corporate-gray",
    name: "Corporate Gray",
    prompt: "Professional business portrait of a person, wearing a charcoal gray blazer over light blue shirt, neutral gray gradient background, studio lighting from the side, confident expression, head tilted slightly, corporate executive style, photorealistic",
  },
  {
    id: "corporate-black",
    name: "Corporate Classic",
    prompt: "Executive headshot of a person, wearing classic black suit with crisp white shirt and subtle tie, dark gradient background, dramatic Rembrandt lighting, serious yet approachable expression, three-quarter view pose, CEO portrait style, photorealistic",
  },
  // Business casual - varied poses
  {
    id: "business-casual-blue",
    name: "Business Casual Blue",
    prompt: "Modern professional headshot of a person, wearing light blue oxford button-up shirt with sleeves slightly rolled, soft white background, natural window lighting, warm genuine smile, relaxed shoulders, friendly approachable vibe, photorealistic",
  },
  {
    id: "business-casual-white",
    name: "Business Casual White",
    prompt: "Clean professional portrait of a person, wearing crisp white shirt with open collar no tie, light gray background, soft even lighting, subtle confident smile, slight head tilt, modern business casual style, photorealistic",
  },
  {
    id: "smart-casual-sweater",
    name: "Smart Casual",
    prompt: "Approachable professional headshot of a person, wearing navy blue crewneck sweater over collared shirt, warm beige background, soft natural lighting, friendly welcoming expression, shoulders squared to camera, startup professional vibe, photorealistic",
  },
  // Creative professional styles
  {
    id: "creative-turtleneck",
    name: "Creative Professional",
    prompt: "Artistic professional headshot of a person, wearing black turtleneck sweater, pure white minimalist background, dramatic side lighting creating depth, thoughtful expression, face turned slightly with eyes to camera, designer aesthetic, photorealistic",
  },
  {
    id: "creative-modern",
    name: "Modern Creative",
    prompt: "Contemporary professional portrait of a person, wearing dark gray henley shirt, abstract blurred colorful background with bokeh, natural artistic lighting, genuine relaxed smile, casual confident pose, creative industry style, photorealistic",
  },
  // Outdoor/Natural - environmental variety
  {
    id: "outdoor-golden",
    name: "Golden Hour",
    prompt: "Outdoor professional headshot of a person, wearing smart casual blazer over t-shirt, natural park setting with green foliage bokeh background, warm golden hour sunlight, authentic happy expression, environmental portrait style, photorealistic",
  },
  {
    id: "outdoor-urban",
    name: "Urban Professional",
    prompt: "City professional portrait of a person, wearing modern business casual attire dark jacket, blurred urban architecture background, natural daylight, confident determined expression, slightly angled stance, metropolitan professional style, photorealistic",
  },
  {
    id: "outdoor-natural",
    name: "Natural Light",
    prompt: "Natural light portrait of a person, wearing casual professional earth-tone clothing, soft blurred nature background with trees, diffused overcast lighting, warm approachable smile, relaxed natural pose, lifestyle headshot style, photorealistic",
  },
  // Executive variations
  {
    id: "executive-classic",
    name: "Executive Classic",
    prompt: "Distinguished executive portrait of a person, wearing premium dark suit with pocket square, rich mahogany wood panel background, professional studio lighting, dignified confident expression, powerful stance, boardroom ready style, photorealistic",
  },
  {
    id: "executive-modern",
    name: "Executive Modern",
    prompt: "Contemporary executive headshot of a person, wearing slim fit charcoal suit modern cut, sleek dark gradient background, cinematic lighting, sharp focused expression, dynamic angle, C-suite modern style, photorealistic",
  },
  // Tech/Startup styles
  {
    id: "tech-startup",
    name: "Tech Startup",
    prompt: "Tech founder headshot of a person, wearing casual gray hoodie, clean minimal white background, bright even lighting, enthusiastic genuine smile, relaxed approachable pose, Silicon Valley startup style, photorealistic",
  },
  {
    id: "tech-professional",
    name: "Tech Professional",
    prompt: "Modern tech professional portrait of a person, wearing fitted black t-shirt, simple gradient background, soft modern lighting, confident slight smile, shoulders angled, innovative tech industry style, photorealistic",
  },
  // Industry specific
  {
    id: "healthcare",
    name: "Healthcare Professional",
    prompt: "Healthcare professional headshot of a person, wearing clean white medical coat over blue scrubs, clinical white background, bright even lighting, compassionate trustworthy smile, professional medical portrait style, photorealistic",
  },
  {
    id: "academic",
    name: "Academic Professional",
    prompt: "Academic professional portrait of a person, wearing tweed blazer with elbow patches over button shirt, warm library background with blurred bookshelves, natural warm lighting, intellectual friendly expression, scholarly style, photorealistic",
  },
  {
    id: "real-estate",
    name: "Real Estate Agent",
    prompt: "Real estate professional headshot of a person, wearing sharp business suit in navy, bright clean background, professional lighting, big confident trustworthy smile, welcoming pose, agent profile photo style, photorealistic",
  },
  {
    id: "finance",
    name: "Finance Professional",
    prompt: "Finance professional portrait of a person, wearing conservative pinstripe suit with subtle tie, classic gray background, traditional portrait lighting, composed confident expression, trust-inspiring pose, Wall Street style, photorealistic",
  },
  {
    id: "legal",
    name: "Legal Professional",
    prompt: "Attorney professional headshot of a person, wearing formal dark suit with conservative tie, traditional law office background with books, dignified lighting, serious authoritative expression, commanding presence, legal industry style, photorealistic",
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

// Generate instant headshots using InstantID for identity-preserving generation
// This creates NEW images with different poses/outfits while keeping the same face
export async function generateInstantHeadshots(
  inputImageUrl: string,
  styles: string[] = ["corporate-navy", "business-casual-blue", "creative-turtleneck"],
  quality: "standard" | "premium" = "standard"
): Promise<GenerationResult[]> {
  const selectedStyles = HEADSHOT_STYLES.filter((s) => styles.includes(s.id));

  const results: GenerationResult[] = [];

  // Negative prompt to avoid common issues
  const negativePrompt = "blurry, low quality, distorted face, extra limbs, bad anatomy, disfigured, poorly drawn face, mutation, mutated, ugly, disgusting, watermark, text, logo, cartoon, anime, illustration, painting, drawing, sketch";

  // Generate headshots sequentially to avoid rate limits
  for (const style of selectedStyles) {
    try {
      console.log(`Generating ${style.name} with InstantID...`);

      // Use InstantID for identity-preserving generation with full variety
      const output = await replicate.run("zsxkib/instant-id" as `${string}/${string}`, {
        input: {
          image: inputImageUrl,
          prompt: style.prompt,
          negative_prompt: negativePrompt,
          num_inference_steps: quality === "premium" ? 30 : 20,
          guidance_scale: 5,
          ip_adapter_scale: 0.8, // Strong identity preservation
          controlnet_conditioning_scale: 0.8,
          num_outputs: 1,
          output_format: "jpg",
          output_quality: quality === "premium" ? 95 : 85,
        },
      });

      const imageUrl = Array.isArray(output) ? output[0] : output;

      if (imageUrl) {
        results.push({
          id: `${style.id}-${Date.now()}`,
          style: style.id,
          styleName: style.name,
          imageUrl: imageUrl as string,
          quality,
        });
        console.log(`Completed ${style.name}`);
      }

      // Small delay between requests to respect rate limits
      if (selectedStyles.indexOf(style) < selectedStyles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Failed to generate ${style.name}:`, error);

      // Fallback to FLUX Kontext if InstantID fails
      try {
        console.log(`Falling back to FLUX Kontext for ${style.name}...`);
        const fallbackOutput = await replicate.run("black-forest-labs/flux-kontext-pro" as `${string}/${string}`, {
          input: {
            prompt: style.prompt,
            input_image: inputImageUrl,
            aspect_ratio: "3:4",
            output_format: "jpg",
            safety_tolerance: 2,
          },
        });

        const fallbackUrl = Array.isArray(fallbackOutput) ? fallbackOutput[0] : fallbackOutput;
        if (fallbackUrl) {
          results.push({
            id: `${style.id}-${Date.now()}`,
            style: style.id,
            styleName: style.name,
            imageUrl: fallbackUrl as string,
            quality,
          });
          console.log(`Completed ${style.name} (fallback)`);
        }
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${style.name}:`, fallbackError);
      }
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

  const negativePrompt = "blurry, low quality, distorted face, extra limbs, bad anatomy, disfigured, poorly drawn face, mutation, mutated, ugly, disgusting, watermark, text, logo, cartoon, anime, illustration, painting, drawing, sketch";

  try {
    // Use InstantID with premium settings
    const output = await replicate.run("zsxkib/instant-id" as `${string}/${string}`, {
      input: {
        image: inputImageUrl,
        prompt: styleConfig.prompt + ", ultra high quality, extremely detailed, professional photography, 8K",
        negative_prompt: negativePrompt,
        num_inference_steps: 40, // More steps for premium
        guidance_scale: 6,
        ip_adapter_scale: 0.85, // Slightly higher for premium
        controlnet_conditioning_scale: 0.8,
        num_outputs: 1,
        output_format: "png",
        output_quality: 100,
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
