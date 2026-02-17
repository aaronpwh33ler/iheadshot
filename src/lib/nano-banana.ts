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
  // Condensed prompt sentence used in generation (matches revised text files)
  promptSentence: string;
  promptSentenceFemale?: string;
}

/**
 * Get the gender-appropriate outfit for a style
 */
export function getOutfitForGender(style: HeadshotStyle, gender?: string): string {
  if (gender === "female" && style.outfitFemale) return style.outfitFemale;
  return style.outfit;
}

/**
 * Get the gender-appropriate prompt sentence for a style
 */
export function getPromptSentenceForGender(style: HeadshotStyle, gender?: string): string {
  if (gender === "female" && style.promptSentenceFemale) return style.promptSentenceFemale;
  return style.promptSentence;
}

// Predefined styles with variables (20 total for Premium tier)
// promptSentence values match the revised text files exactly
export const HEADSHOT_STYLES: HeadshotStyle[] = [
  // === OUTDOOR (3) ===
  {
    id: "outdoor-natural",
    name: "Natural Light",
    outfit: "a casual but professional light jacket",
    location: "outdoors in a green park",
    lighting: "golden hour warm sunlight",
    pose: "standing naturally",
    expression: "approachable and genuine",
    promptSentence: "Wearing a casual but professional light jacket, standing outdoors in a green park with at golden hour warm sunlight, standing naturally, approachable and genuine",
  },
  {
    id: "outdoor-urban",
    name: "Urban Professional",
    outfit: "a blazer with T-shirt",
    location: "on a city rooftop",
    lighting: "golden hour warm sunlight",
    pose: "standing naturally",
    expression: "professional and personable",
    promptSentence: "Wearing a blazer with T-shirt, standing on a city rooftop at golden hour warm sunlight, standing naturally, professional and personable",
  },
  {
    id: "outdoor-sunset",
    name: "Golden Hour",
    outfit: "a button-up shirt",
    location: "outdoors with warm sunset backlighting",
    lighting: "warm sunset backlighting",
    pose: "natural pose",
    expression: "warm and inviting",
    promptSentence: "Wearing a button-up shirt, outdoors with warm sunset backlighting, natural pose, warm and inviting",
  },
  // === CORPORATE (3) ===
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    outfit: "a navy suit with white shirt",
    location: "in a corporate office",
    lighting: "soft daylight",
    pose: "standing confidently",
    expression: "approachable with a subtle smile",
    promptSentence: "Wearing a navy suit with white shirt, in a corporate office, soft daylight, standing confidently, approachable with a subtle smile",
  },
  {
    id: "corporate-gray",
    name: "Corporate Gray",
    outfit: "a gray suit and light blue tie",
    outfitFemale: "a charcoal gray blazer with silk blouse",
    location: "white studio backdrop",
    lighting: "dramatic studio lighting",
    pose: "standing professionally",
    expression: "warm and professional",
    promptSentence: "Wearing a gray suit and light blue tie, white studio backdrop, dramatic studio lighting, standing professionally, warm and professional",
    promptSentenceFemale: "Wearing a charcoal gray blazer with silk blouse, white studio backdrop, dramatic studio lighting, standing professionally, warm and professional",
  },
  {
    id: "executive-black",
    name: "Executive Black",
    outfit: "a black suit with white pocket square",
    outfitFemale: "a black suit with a structured white top",
    location: "in an executive office with dark wood",
    lighting: "dramatic side lighting",
    pose: "arms crossed confidently",
    expression: "authoritative yet approachable",
    promptSentence: "Wearing a black suit with white pocket square, in an executive office with dark wood at dramatic side lighting, arms crossed confidently, authoritative yet approachable",
    promptSentenceFemale: "Wearing a black suit with a structured white top, in an executive office with dark wood at dramatic side lighting, arms crossed confidently, authoritative yet approachable",
  },
  // === CASUAL (3) ===
  {
    id: "casual-blue-shirt",
    name: "Blue Oxford",
    outfit: "a blue oxford shirt with rolled sleeves",
    location: "in a modern office with plants",
    lighting: "natural window light",
    pose: "leaning against a desk",
    expression: "friendly and relaxed",
    promptSentence: "Wearing a blue oxford shirt with rolled sleeves, in a modern office with plants at natural window light, leaning against a desk, friendly and relaxed",
  },
  {
    id: "casual-white-shirt",
    name: "Business Casual White",
    outfit: "a white linen shirt open collar",
    location: "in minimalist studio",
    lighting: "natural window light",
    pose: "standing relaxed",
    expression: "warm and genuine",
    promptSentence: "Wearing a white linen shirt open collar, in minimalist studio natural window light, standing relaxed, warm and genuine",
  },
  {
    id: "smart-casual-sweater",
    name: "Smart Casual",
    outfit: "a navy sweater over white collared shirt",
    location: "cozy office",
    lighting: "warm ambient lighting",
    pose: "sitting comfortably",
    expression: "thoughtful and engaged with camera",
    promptSentence: "Wearing a navy sweater over white collared shirt, cozy office, warm ambient lighting, sitting comfortably, thoughtful and engaged with camera",
  },
  // === CREATIVE (3) ===
  {
    id: "creative-turtleneck",
    name: "Creative Turtleneck",
    outfit: "a black turtleneck",
    location: "against a white wall",
    lighting: "dramatic studio lighting",
    pose: "slight head tilt",
    expression: "confident and creative",
    promptSentence: "Wearing a black turtleneck, against a white wall with dramatic studio lighting, slight head tilt, confident and creative",
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    outfit: "a gray hoodie",
    location: "in a tech office with exposed brick",
    lighting: "natural daylight",
    pose: "casual pose",
    expression: "innovative and friendly",
    promptSentence: "Wearing a gray hoodie, in a tech office with exposed brick at natural daylight, casual pose, innovative and friendly",
  },
  {
    id: "creative-neon",
    name: "Creative Neon",
    outfit: "a black t-shirt",
    location: "in a dark studio with neon light projections",
    lighting: "low-key lighting with pink, blue, and purple gels",
    pose: "three-quarter angle",
    expression: "cool and self-assured",
    promptSentence: "Wearing a black t-shirt, in a dark studio with neon light projections at low-key lighting with pink, blue, and purple gels, three-quarter angle, cool and self-assured",
  },
  // === STUDIO (3 - includes dark-dramatic) ===
  {
    id: "classic-studio",
    name: "Classic Studio",
    outfit: "a dark blazer over white shirt",
    location: "seamless white studio backdrop",
    lighting: "dramatic studio lighting",
    pose: "standing straight with shoulders angled",
    expression: "polished and confident",
    promptSentence: "Wearing a dark blazer over white shirt, seamless white studio backdrop, dramatic studio lighting, standing straight with shoulders angled, polished and confident",
  },
  {
    id: "warm-studio",
    name: "Warm Studio",
    outfit: "a brown suit jacket",
    location: "warm cream backdrop",
    lighting: "warm studio lighting",
    pose: "standing relaxed natural pose",
    expression: "friendly and relaxed",
    promptSentence: "Wearing a brown suit jacket, warm cream backdrop, warm studio lighting, standing relaxed natural pose, friendly and relaxed",
  },
  {
    id: "dark-dramatic",
    name: "Dark & Dramatic",
    outfit: "a dark suit jacket over black shirt",
    location: "charcoal gradient background",
    lighting: "Rembrandt side lighting",
    pose: "three-quarter angle with chin raised",
    expression: "intense and commanding",
    promptSentence: "Wearing a dark suit jacket over black shirt, charcoal gradient background at Rembrandt side lighting, three-quarter angle with chin raised, intense and commanding",
  },
  // === INDUSTRY (5) ===
  {
    id: "finance-exec",
    name: "Finance Executive",
    outfit: "a pinstripe suit with silk tie",
    outfitFemale: "a pinstripe suit with silk camisole",
    location: "in a financial office",
    lighting: "professional lighting",
    pose: "seated at a desk",
    expression: "confident and trustworthy",
    promptSentence: "Wearing a pinstripe suit with silk tie, in a financial office at professional lighting, seated at a desk, confident and trustworthy",
    promptSentenceFemale: "Wearing a pinstripe suit with silk camisole, in a financial office at professional lighting, seated at a desk, confident and trustworthy",
  },
  {
    id: "healthcare-pro",
    name: "Healthcare Professional",
    outfit: "a white medical coat over professional attire",
    location: "in a medical facility",
    lighting: "bright clean lighting",
    pose: "standing professionally",
    expression: "trustworthy and caring",
    promptSentence: "Wearing a white medical coat over professional attire, in a medical facility at bright clean lighting, standing professionally, trustworthy and caring",
  },
  {
    id: "academic-scholar",
    name: "Academic",
    outfit: "a tweed blazer with elbow patches over a button-up",
    location: "in a library",
    lighting: "warm lighting",
    pose: "seated thoughtfully",
    expression: "scholarly and approachable",
    promptSentence: "Wearing a tweed blazer with elbow patches over a button-up, in a library at warm lighting, seated thoughtfully, scholarly and approachable",
  },
  {
    id: "legal-pro",
    name: "Legal Professional",
    outfit: "a dark suit with conservative tie",
    outfitFemale: "a dark suit with tailored blouse",
    location: "in a law office",
    lighting: "classic lighting",
    pose: "standing authoritatively",
    expression: "professional and composed",
    promptSentence: "Wearing a dark suit with conservative tie, in a law office at classic lighting, standing authoritatively, professional and composed",
    promptSentenceFemale: "Wearing a dark suit with tailored blouse, in a law office at classic lighting, standing authoritatively, professional and composed",
  },
  {
    id: "real-estate",
    name: "Real Estate Agent",
    outfit: "a blazer over button-up shirt",
    location: "outside modern home",
    lighting: "warm daylight",
    pose: "open welcoming body language",
    expression: "trustworthy and confident",
    promptSentence: "Wearing a blazer over button-up shirt, outside modern home, warm daylight, trustworthy and confident",
  },
];

/**
 * Generate a headshot directly from uploaded reference images (no character sheet needed).
 * Uses all uploaded images for cross-referencing identity, with the revised prompt structure.
 */
export async function generateHeadshotFromReferences(
  referenceImagesBase64: string[],
  style: HeadshotStyle,
  mimeType: string = "image/jpeg",
  gender?: string
): Promise<string> {
  const model = genAI.models;

  // Get the condensed prompt sentence for the style (gender-aware)
  const styleSentence = getPromptSentenceForGender(style, gender);

  // Revised prompt structure — matches the text files exactly
  const prompt = `Average out the submitted images of the individual into a consistent character for the following prompt. (If you notice consistency across the submitted images in the individual's hair, then keep that hair style EXACTLY the same! Assume that is the style of hair the individual would like preserved.) Keep faces looking young and flattering, not leaning towards fat, old, wrinkles, deep crows feet wrinkles near eyes, pale, ache or facial blemishes, yellow teeth, or any negatively associated descriptors that could cause users frustration. The goal is to generate an image of the individual that is beautiful, handsome, and flattering, that they would be happy paying a hefty dollar for.

Professional headshot, for business profiles, profile pictures, and respectable contact images. To be used solely in the business sphere. ${styleSentence}. Professional post processing and image editing, smoothing skin imperfections and flattering photography angle, to minimize large individuals or any unflattering angles. thoughtful and flattering image capture. Output image must be 3:4 portrait orientation (1536x2048 pixels).`;

  // Build image parts for ALL reference images
  const imageParts = referenceImagesBase64.map((imgBase64) => ({
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
 * @deprecated Character sheet generation is no longer used in the pipeline.
 * Kept for reference. Users now upload 5-10 images directly.
 */
export async function generateCharacterSheet(
  referenceImagesBase64: string | string[],
  mimeType: string = "image/jpeg"
): Promise<string> {
  const model = genAI.models;
  const images = Array.isArray(referenceImagesBase64)
    ? referenceImagesBase64
    : [referenceImagesBase64];

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

  const imageParts = images.map((imgBase64) => ({
    inlineData: { mimeType, data: imgBase64 },
  }));

  let response;
  try {
    response = await model.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: "user", parts: [...imageParts, { text: prompt }] }],
      config: { responseModalities: ["image", "text"] },
    });
  } catch (apiError) {
    console.error("Google GenAI API error:", apiError);
    throw new Error(`Google GenAI API failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
  }

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) =>
    part && typeof part === 'object' && 'inlineData' in part
  ) as { inlineData?: { data: string } } | undefined;

  if (!imagePart?.inlineData?.data) {
    throw new Error("Failed to generate character sheet - no image in response");
  }

  return imagePart.inlineData.data;
}

/**
 * @deprecated Use generateHeadshotFromReferences instead.
 * Kept for backward compatibility.
 */
export async function generateHeadshotWithIdentityLock(
  referenceImageBase64: string,
  characterSheetBase64: string,
  style: HeadshotStyle,
  mimeType: string = "image/jpeg",
  gender?: string
): Promise<string> {
  // Redirect to new function, passing both images as references
  return generateHeadshotFromReferences(
    [referenceImageBase64, characterSheetBase64],
    style,
    mimeType,
    gender
  );
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
