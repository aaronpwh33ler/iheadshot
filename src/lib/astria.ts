const ASTRIA_API_URL = "https://api.astria.ai";
const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY;

interface AstriaTuneResponse {
  id: number;
  title: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  url?: string;
  eta?: string;
}

interface AstriaPromptResponse {
  id: number;
  text: string;
  status: string;
  images?: string[];
  created_at: string;
}

// Create a fine-tuning job (tune)
export async function createTune(
  imageUrls: string[],
  title: string,
  callbackUrl: string
): Promise<AstriaTuneResponse> {
  const response = await fetch(`${ASTRIA_API_URL}/tunes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ASTRIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tune: {
        title: title,
        name: "person", // Trigger word for generation
        base_tune_id: null, // Uses default Flux model
        image_urls: imageUrls,
        callback: callbackUrl,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Astria API error: ${error}`);
  }

  return response.json();
}

// Generate headshots using a trained tune
export async function generateHeadshots(
  tuneId: string | number,
  prompts: string[],
  callbackUrl: string
): Promise<AstriaPromptResponse[]> {
  const responses: AstriaPromptResponse[] = [];

  // Astria API may require batching prompts
  for (const prompt of prompts) {
    const response = await fetch(`${ASTRIA_API_URL}/tunes/${tuneId}/prompts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: {
          text: prompt,
          callback: callbackUrl,
          num_images: 4, // Generate 4 variations per prompt
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Astria prompt error: ${error}`);
      continue;
    }

    const data = await response.json();
    responses.push(data);
  }

  return responses;
}

// Get tune status
export async function getTuneStatus(tuneId: string | number): Promise<AstriaTuneResponse> {
  const response = await fetch(`${ASTRIA_API_URL}/tunes/${tuneId}`, {
    headers: {
      Authorization: `Bearer ${ASTRIA_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Astria API error: ${error}`);
  }

  return response.json();
}

// Professional headshot prompts - battle-tested for quality
export function getHeadshotPrompts(count: number): string[] {
  const basePrompts = [
    // Corporate/Professional
    "professional headshot of person, wearing navy blue suit, clean white background, soft studio lighting, LinkedIn profile photo, high resolution, sharp focus, professional photography",
    "corporate portrait of person, wearing charcoal gray blazer with white shirt, neutral gray background, professional lighting, business photo, confident expression",
    "executive headshot of person, wearing black suit with white shirt, gradient gray background, studio lighting, CEO portrait style, authoritative yet approachable",
    "professional headshot of person, wearing dark blue business attire, soft white background, natural window lighting, corporate style, warm smile",

    // Business Casual
    "professional headshot of person, wearing light blue button-up shirt, white background, natural soft lighting, friendly approachable expression, modern professional",
    "business casual portrait of person, wearing navy sweater over collared shirt, soft gray background, warm lighting, relaxed professional look",
    "modern professional headshot of person, wearing casual blazer with open collar, minimalist background, natural lighting, tech industry style",
    "contemporary headshot of person, wearing smart casual attire, blurred office background, soft lighting, startup professional vibe",

    // Creative Professional
    "artistic professional headshot of person, wearing black turtleneck, minimalist white background, dramatic studio lighting, creative industry style",
    "modern creative portrait of person, wearing dark casual attire, colorful blurred background bokeh, natural light, designer aesthetic",
    "stylish professional headshot of person, wearing contemporary fashion, clean geometric background, editorial lighting, fashion forward",

    // Outdoor/Natural
    "professional outdoor headshot of person, natural greenery background with soft bokeh, golden hour lighting, warm natural tones, approachable executive",
    "natural light portrait of person, blurred outdoor background, soft diffused sunlight, professional yet relaxed, lifestyle headshot",
    "environmental portrait of person, architectural background blurred, natural lighting, urban professional style, confident pose",

    // Industry Specific
    "real estate agent headshot of person, wearing professional blazer, bright friendly smile, clean background, trustworthy appearance, high resolution",
    "healthcare professional portrait of person, wearing white coat or professional attire, clean background, compassionate expression, medical industry style",
    "tech professional headshot of person, modern casual attire, minimal background, natural lighting, Silicon Valley aesthetic",
    "consultant headshot of person, wearing professional suit, confident expression, neutral background, advisory presence",

    // Expression Variations
    "professional headshot of person, confident subtle smile, professional attire, clean background, approachable yet authoritative",
    "corporate portrait of person, neutral professional expression, business attire, studio lighting, executive presence",
    "friendly professional headshot of person, warm genuine smile, business casual, soft lighting, personable and trustworthy",
  ];

  // Repeat and vary prompts to reach desired count
  const prompts: string[] = [];
  let promptIndex = 0;

  while (prompts.length < count) {
    // Add some variation to repeated prompts
    const basePrompt = basePrompts[promptIndex % basePrompts.length];
    const variations = [
      "",
      ", slightly different angle",
      ", alternative lighting",
      ", subtle expression variation",
    ];
    const variation = variations[Math.floor(prompts.length / basePrompts.length) % variations.length];
    prompts.push(basePrompt + variation);
    promptIndex++;
  }

  return prompts.slice(0, count);
}

// Calculate how many prompts needed for desired image count
// Astria generates ~4 images per prompt
export function calculatePromptsNeeded(desiredImages: number): number {
  return Math.ceil(desiredImages / 4);
}
