import { GoogleGenAI } from "@google/genai";

// Initialize the Nano Banana Pro API (Gemini 3 Pro Image)
// WORKING MODEL: gemini-3-pro-image-preview - produces incredible identity-locked results
// This was the model used when results were "freaking incredible" on Feb 4, 2026
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || "" });
const IMAGE_MODEL = "gemini-3-pro-image-preview";

// Style variables for headshot generation
export interface HeadshotStyle {
  id: string;
  name: string;
  outfit: string;
  outfitFemale?: string; // Female variant (only where clothing differs)
  location: string;
  lighting: string;
  pose: string;
  expression: string;
}

/**
 * Get the gender-appropriate outfit for a style
 */
export function getOutfitForGender(style: HeadshotStyle, gender?: string): string {
  if (gender === "female" && style.outfitFemale) return style.outfitFemale;
  return style.outfit;
}

// Predefined styles with variables (20 total for Premium tier)
export const HEADSHOT_STYLES: HeadshotStyle[] = [
  // === OUTDOOR (3) ===
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
  // === CORPORATE (3) ===
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    outfit: "a tailored navy blue suit with a crisp white dress shirt",
    outfitFemale: "a tailored navy blue blazer with a crisp white blouse",
    location: "in a modern corporate office with floor-to-ceiling windows",
    lighting: "soft natural daylight",
    pose: "standing confidently with shoulders back",
    expression: "confident and approachable with a subtle smile",
  },
  {
    id: "corporate-gray",
    name: "Corporate Gray",
    outfit: "a charcoal gray business suit with a light blue tie",
    outfitFemale: "a tailored charcoal gray blazer with a silk blouse",
    location: "in front of a clean white studio backdrop",
    lighting: "professional studio lighting with soft shadows",
    pose: "seated professionally",
    expression: "warm and professional",
  },
  {
    id: "executive-black",
    name: "Executive Black",
    outfit: "a sharp black suit with a white pocket square",
    outfitFemale: "a sharp black suit with a structured white top",
    location: "in an elegant executive office with dark wood furnishings",
    lighting: "dramatic side lighting",
    pose: "standing with arms crossed confidently",
    expression: "authoritative yet approachable",
  },
  // === CASUAL (3) ===
  {
    id: "casual-blue-shirt",
    name: "Blue Oxford",
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
    name: "Smart Casual",
    outfit: "a navy blue crewneck sweater over a white collared shirt",
    location: "in a cozy modern office space",
    lighting: "warm ambient lighting",
    pose: "sitting comfortably",
    expression: "thoughtful and engaged",
  },
  // === CREATIVE (3) ===
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
  {
    id: "creative-neon",
    name: "Creative Neon",
    outfit: "a fitted black crew-neck t-shirt",
    location: "in a dark studio with colorful neon light projections and geometric patterns cast across the face and background",
    lighting: "dramatic low-key lighting with vibrant neon pink, blue, and purple color gels creating cinematic color contrast",
    pose: "slight three-quarter angle with a relaxed confident stance",
    expression: "cool and self-assured with a subtle knowing look",
  },
  // === STUDIO (2) ===
  {
    id: "classic-studio",
    name: "Classic Studio",
    outfit: "a classic dark blazer over a clean white shirt",
    location: "in front of a seamless pure white studio backdrop",
    lighting: "soft even studio lighting with subtle fill light",
    pose: "standing straight with shoulders slightly angled",
    expression: "polished and confident with a natural smile",
  },
  {
    id: "warm-studio",
    name: "Warm Studio",
    outfit: "a soft earth-tone cashmere sweater with a collared shirt underneath",
    location: "in front of a warm cream and soft beige textured backdrop",
    lighting: "warm golden studio lighting with gentle fill",
    pose: "relaxed natural pose with shoulders at ease",
    expression: "genuinely warm and approachable with a kind smile",
  },
  // === ARTISTIC (1) ===
  {
    id: "dark-dramatic",
    name: "Dark & Dramatic",
    outfit: "a dark tailored suit jacket over a black shirt",
    location: "against a deep charcoal gradient background fading to black",
    lighting: "dramatic Rembrandt lighting with a single key light from the side",
    pose: "three-quarter face angle with chin slightly raised",
    expression: "intense and commanding with quiet confidence",
  },
  // === INDUSTRY (5) ===
  {
    id: "finance-exec",
    name: "Finance Executive",
    outfit: "a premium pinstripe suit with silk tie",
    outfitFemale: "a premium pinstripe suit with a silk camisole",
    location: "in an upscale financial office",
    lighting: "professional office lighting",
    pose: "seated at an executive desk",
    expression: "confident and trustworthy",
  },
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
    id: "legal-pro",
    name: "Legal Professional",
    outfit: "a traditional dark suit with conservative tie",
    outfitFemale: "a traditional dark suit with a tailored blouse",
    location: "in a distinguished law office with leather chairs",
    lighting: "classic office lighting",
    pose: "standing authoritatively",
    expression: "professional and composed",
  },
  {
    id: "real-estate",
    name: "Real Estate Agent",
    outfit: "a sharp fitted blazer over a professional button-up shirt",
    location: "in front of a bright modern home exterior with soft bokeh landscaping",
    lighting: "warm natural daylight",
    pose: "standing with open welcoming body language",
    expression: "big trustworthy smile radiating warmth and confidence",
  },
];

/**
 * Step 1: Generate a character reference sheet from uploaded images
 * This creates multi-angle views to lock in the person's identity.
 * Multiple images help cross-reference details like eye color, skin tone, features.
 */
export async function generateCharacterSheet(
  referenceImagesBase64: string | string[],
  mimeType: string = "image/jpeg"
): Promise<string> {
  const model = genAI.models;

  // Normalize to array
  const images = Array.isArray(referenceImagesBase64)
    ? referenceImagesBase64
    : [referenceImagesBase64];

  // Multi-image prompt emphasizes CROSS-REFERENCING and PHOTOREALISM
  const prompt = images.length > 1
    ? `IMPORTANT: The attached ${images.length} photos are ALL of the SAME PERSON from different angles/lighting.

Cross-reference ALL photos to identify the TRUE, CONSISTENT features:
- Eye color: Look at ALL photos to determine the ACTUAL eye color (lighting can distort this)
- Face shape: Identify the consistent bone structure across all angles
- Skin tone and texture: Find the true skin color accounting for different lighting
- Hair: Texture, color, hairline consistency
- Unique features: Freckles, marks, wrinkles that appear in MULTIPLE photos

Create a PHOTOREALISTIC character reference sheet showing this SAME person: front view, left profile, right profile, 3/4 view. Plain white background, neutral expression.

CRITICAL STYLE REQUIREMENTS:
- PHOTOREALISTIC only - like a real photograph, NOT a cartoon, illustration, drawing, or digital art
- Real skin texture with pores, natural lighting on skin
- Photo-quality detail matching the input photos
- NO cartoon style, NO illustration style, NO artistic rendering
- Output must look like actual photographs of the person

The reference sheet must be 100% consistent with ALL provided photos - this is the SAME individual.`
    : `Create a PHOTOREALISTIC character reference sheet: front view, left profile, right profile, 3/4 view, neutral expression, plain white background, same person as in the attached reference image.

CRITICAL: Output must be PHOTOREALISTIC - like real photographs, NOT cartoon, NOT illustration, NOT digital art. Real skin texture, photo-quality detail, natural lighting. Must look like actual photos of this person.`;

  // Build image parts for all reference images
  const imageParts = images.map((imgBase64) => ({
    inlineData: {
      mimeType,
      data: imgBase64,
    },
  }));

  let response;
  try {
    response = await model.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
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
  mimeType: string = "image/jpeg",
  gender?: string
): Promise<string> {
  const model = genAI.models;

  // Use gender-appropriate outfit
  const outfit = getOutfitForGender(style, gender);

  const identityLockPrompt = `STRICT IDENTITY LOCK USING REFERENCE IMAGES:

Use ALL attached reference images as the absolute ground truth for this character's identity.
- Main reference: exact face, skin tone/texture/details, eye shape/color, nose, mouth, jawline, hairline, freckles/marks, age appearance.
- Character sheet: full multi-angle confirmation of proportions, head shape from side/profile/3/4 views, expressions range, no alterations allowed.

Preserve 100% identical facial features, bone structure, exact face shape, exact eye placement & color, nose shape, lip shape, skin texture/details, hair texture/density/parting, age/youth appearance — NO changes, NO morphing, NO aging, NO plastic look, NO blending with other faces.

CRITICAL - DO NOT AGE THE SUBJECT:
- Do NOT add crow's feet, wrinkles, or lines that aren't clearly visible in the reference photos
- Do NOT make skin look more weathered or aged than in the references
- Do NOT deepen existing wrinkles or make them more pronounced
- Preserve the EXACT skin smoothness and texture from the reference images
- If the person looks youthful in the references, they must look equally youthful in the output
- Match the exact level of skin detail - no more, no less

OUTPUT FORMAT: Portrait orientation (2:3 aspect ratio), professional headshot crop showing head and shoulders.

Scene: Professional headshot for business profiles. Wearing ${outfit}, ${style.location}, ${style.lighting}, ${style.pose}, ${style.expression}.

Ultra-photorealistic, high-fidelity identity preservation, sharp facial details, natural skin texture matching references exactly.`;

  let response;
  try {
    response = await model.generateContent({
      model: IMAGE_MODEL,
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
      name: "🌿 Outdoor & Natural",
      description: "Beautiful natural settings",
      recommended: true,
      styles: HEADSHOT_STYLES.filter((s) =>
        ["outdoor-natural", "outdoor-urban", "outdoor-sunset"].includes(s.id)
      ),
    },
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
        ["creative-turtleneck", "tech-startup", "creative-neon"].includes(s.id)
      ),
    },
    {
      name: "📸 Studio",
      description: "Classic studio portraits",
      styles: HEADSHOT_STYLES.filter((s) =>
        ["classic-studio", "warm-studio", "dark-dramatic"].includes(s.id)
      ),
    },
    {
      name: "🏥 Industry Specific",
      description: "Profession-focused looks",
      styles: HEADSHOT_STYLES.filter((s) =>
        ["finance-exec", "healthcare-pro", "academic-scholar", "legal-pro", "real-estate"].includes(s.id)
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
