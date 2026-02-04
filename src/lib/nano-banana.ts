import { GoogleGenAI } from "@google/genai";

// Initialize the Nano Banana Pro API (Gemini 3 Pro Image)
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || "" });

// Style variables for headshot generation
export interface HeadshotStyle {
  id: string;
  name: string;
  outfit: string;
  location: string;
  lighting: string;
  pose: string;
  expression: string;
}

// Predefined styles with variables
export const HEADSHOT_STYLES: HeadshotStyle[] = [
  // Corporate / Business
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    outfit: "a tailored navy blue suit with a crisp white dress shirt",
    location: "in a modern corporate office with floor-to-ceiling windows",
    lighting: "soft natural daylight",
    pose: "standing confidently with shoulders back",
    expression: "confident and approachable with a subtle smile",
  },
  {
    id: "corporate-gray",
    name: "Corporate Gray",
    outfit: "a charcoal gray business suit with a light blue tie",
    location: "in front of a clean white studio backdrop",
    lighting: "professional studio lighting with soft shadows",
    pose: "seated professionally",
    expression: "warm and professional",
  },
  {
    id: "executive-black",
    name: "Executive Black",
    outfit: "a sharp black suit with a white pocket square",
    location: "in an elegant executive office with dark wood furnishings",
    lighting: "dramatic side lighting",
    pose: "standing with arms crossed confidently",
    expression: "authoritative yet approachable",
  },
  // Business Casual
  {
    id: "casual-blue-shirt",
    name: "Business Casual Blue",
    outfit: "a light blue oxford button-up shirt with rolled sleeves",
    location: "in a modern startup office with plants",
    lighting: "bright natural window light",
    pose: "leaning casually against a desk",
    expression: "friendly and relaxed",
  },
  {
    id: "casual-white-shirt",
    name: "Business Casual White",
    outfit: "a crisp white linen shirt, open collar",
    location: "in a bright minimalist studio",
    lighting: "soft diffused natural light",
    pose: "standing relaxed",
    expression: "warm and genuine smile",
  },
  {
    id: "smart-casual-sweater",
    name: "Smart Casual Sweater",
    outfit: "a navy blue crewneck sweater over a white collared shirt",
    location: "in a cozy modern office space",
    lighting: "warm ambient lighting",
    pose: "sitting comfortably",
    expression: "thoughtful and engaged",
  },
  // Creative / Modern
  {
    id: "creative-turtleneck",
    name: "Creative Turtleneck",
    outfit: "a sleek black turtleneck",
    location: "against a clean minimalist white wall",
    lighting: "dramatic studio lighting with strong contrast",
    pose: "standing with a slight head tilt",
    expression: "confident and creative",
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    outfit: "a comfortable gray hoodie",
    location: "in a modern tech office with exposed brick",
    lighting: "natural daylight mixed with cool LED",
    pose: "casual standing pose",
    expression: "innovative and friendly",
  },
  // Outdoor / Natural
  {
    id: "outdoor-natural",
    name: "Natural Light",
    outfit: "a casual but professional light jacket",
    location: "outdoors in a lush green park with soft bokeh background",
    lighting: "golden hour warm sunlight",
    pose: "standing naturally",
    expression: "approachable and genuine",
  },
  {
    id: "outdoor-urban",
    name: "Urban Professional",
    outfit: "a modern blazer with a casual t-shirt underneath",
    location: "on a city rooftop with blurred skyline",
    lighting: "beautiful sunset golden hour light",
    pose: "relaxed confident stance",
    expression: "professional yet personable",
  },
  {
    id: "outdoor-sunset",
    name: "Golden Hour",
    outfit: "a smart casual button-up shirt",
    location: "outdoors with warm sunset colors in the background",
    lighting: "beautiful golden sunset backlighting",
    pose: "natural standing pose",
    expression: "warm and inviting smile",
  },
  // Industry Specific
  {
    id: "healthcare-pro",
    name: "Healthcare Professional",
    outfit: "a clean white medical coat over professional attire",
    location: "in a modern medical facility",
    lighting: "bright, clean clinical lighting",
    pose: "standing professionally",
    expression: "trustworthy and caring",
  },
  {
    id: "academic-scholar",
    name: "Academic",
    outfit: "a tweed blazer with elbow patches over a button-up",
    location: "in a distinguished library with bookshelves",
    lighting: "warm ambient library lighting",
    pose: "seated thoughtfully",
    expression: "scholarly and approachable",
  },
  {
    id: "finance-exec",
    name: "Finance Executive",
    outfit: "a premium pinstripe suit with silk tie",
    location: "in an upscale financial office",
    lighting: "professional office lighting",
    pose: "seated at an executive desk",
    expression: "confident and trustworthy",
  },
  {
    id: "legal-pro",
    name: "Legal Professional",
    outfit: "a traditional dark suit with conservative tie",
    location: "in a distinguished law office with leather chairs",
    lighting: "classic office lighting",
    pose: "standing authoritatively",
    expression: "professional and composed",
  },
];

/**
 * Step 1: Generate a character reference sheet from uploaded images
 * This creates multi-angle views to lock in the person's identity
 */
export async function generateCharacterSheet(
  referenceImageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const model = genAI.models;

  const prompt = `Create a character reference sheet: front view, left profile, right profile, 3/4 view, neutral expression, plain white background, same person as in the attached reference image, ultra-detailed facial features, consistent identity.`;

  let response;
  try {
    response = await model.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: referenceImageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseModalities: ["image", "text"],
      },
    });
  } catch (apiError) {
    console.error("Google GenAI API error:", apiError);
    throw new Error(`Google GenAI API failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
  }

  console.log("Response structure:", JSON.stringify(response, null, 2).substring(0, 1000));

  // Extract the generated image from response
  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) =>
    part && typeof part === 'object' && 'inlineData' in part
  ) as { inlineData?: { data: string } } | undefined;

  if (!imagePart?.inlineData?.data) {
    console.error("No image data found in response. Parts:", JSON.stringify(parts, null, 2).substring(0, 500));
    throw new Error("Failed to generate character sheet - no image in response");
  }

  return imagePart.inlineData.data; // Returns base64
}

/**
 * Step 2: Generate a headshot with strict identity lock
 * Uses the character sheet + original reference for maximum consistency
 */
export async function generateHeadshotWithIdentityLock(
  referenceImageBase64: string,
  characterSheetBase64: string,
  style: HeadshotStyle,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const model = genAI.models;

  const identityLockPrompt = `STRICT IDENTITY LOCK USING REFERENCE IMAGES:

Use ALL attached reference images as the absolute ground truth for this character's identity.
- Main reference: exact face, skin tone/texture/details, eye shape/color, nose, mouth, jawline, hairline, freckles/marks, age appearance.
- Character sheet: full multi-angle confirmation of proportions, head shape from side/profile/3/4 views, expressions range, no alterations allowed.

Preserve 100% identical facial features, bone structure, exact face shape, exact eye placement & color, nose shape, lip shape, skin texture/details, hair texture/density/parting, age/youth appearance — NO changes, NO morphing, NO aging, NO plastic look, NO blending with other faces.

Only modify: Professional headshot, for business profiles, profile pictures, and respectable contact images. To be used solely in the business sphere. Wearing ${style.outfit}, standing ${style.location} at ${style.lighting}, ${style.pose}, ${style.expression}.

Ultra-photorealistic, high-fidelity identity preservation, sharp facial details, consistent lighting on face matching references where possible.`;

  let response;
  try {
    response = await model.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: [
        {
          role: "user",
          parts: [
            // Main reference image first
            {
              inlineData: {
                mimeType,
                data: referenceImageBase64,
              },
            },
            // Character sheet second
            {
              inlineData: {
                mimeType,
                data: characterSheetBase64,
              },
            },
            { text: identityLockPrompt },
          ],
        },
      ],
      config: {
        responseModalities: ["image", "text"],
      },
    });
  } catch (apiError) {
    console.error("Google GenAI API error:", apiError);
    throw new Error(`Google GenAI API failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
  }

  // Extract the generated image
  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) =>
    part && typeof part === 'object' && 'inlineData' in part
  ) as { inlineData?: { data: string } } | undefined;

  if (!imagePart?.inlineData?.data) {
    console.error("No image data found in response. Parts:", JSON.stringify(parts, null, 2).substring(0, 500));
    throw new Error("Failed to generate headshot - no image in response");
  }

  return imagePart.inlineData.data; // Returns base64
}

/**
 * Get styles by category for the frontend
 */
export function getStyleCategories() {
  return [
    {
      name: "👔 Corporate & Business",
      description: "Traditional professional looks",
      styles: HEADSHOT_STYLES.filter((s) =>
        ["corporate-navy", "corporate-gray", "executive-black"].includes(s.id)
      ),
    },
    {
      name: "👕 Business Casual",
      description: "Relaxed professional style",
      styles: HEADSHOT_STYLES.filter((s) =>
        ["casual-blue-shirt", "casual-white-shirt", "smart-casual-sweater"].includes(s.id)
      ),
    },
    {
      name: "🎨 Creative & Modern",
      description: "Contemporary looks",
      styles: HEADSHOT_STYLES.filter((s) =>
        ["creative-turtleneck", "tech-startup"].includes(s.id)
      ),
    },
    {
      name: "🌿 Outdoor & Natural",
      description: "Beautiful natural settings",
      recommended: true,
      styles: HEADSHOT_STYLES.filter((s) =>
        ["outdoor-natural", "outdoor-urban", "outdoor-sunset"].includes(s.id)
      ),
    },
    {
      name: "🏥 Industry Specific",
      description: "Profession-focused looks",
      styles: HEADSHOT_STYLES.filter((s) =>
        ["healthcare-pro", "academic-scholar", "finance-exec", "legal-pro"].includes(s.id)
      ),
    },
  ];
}

/**
 * Helper to convert image URL to base64
 */
export async function imageUrlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const contentType = response.headers.get("content-type") || "image/jpeg";
  return { base64, mimeType: contentType };
}
