"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

// Style configuration
export interface StyleConfig {
  id: string;
  name: string;
  category: string;
  outfit: string;
  location: string;
  lighting: string;
  previewEmoji: string;
  previewImage?: string;
}

// Selected style with user customizations
export interface SelectedStyle {
  id: string;
  name: string;
  outfit: string;
  location: string;
  lighting: string;
  quantity: number;
  isCustom?: boolean;
  customPrompt?: string;
  previewImage?: string;
}

// Dropdown options for customization (kept for generation)
export const OUTFIT_OPTIONS = [
  { value: "a tailored navy blue suit with a crisp white dress shirt", label: "Navy Suit" },
  { value: "a charcoal gray business suit with a light blue tie", label: "Gray Suit" },
  { value: "a sharp black suit with a white pocket square", label: "Black Suit" },
  { value: "a light blue oxford button-up shirt with rolled sleeves", label: "Blue Oxford Shirt" },
  { value: "a crisp white linen shirt, open collar", label: "White Linen Shirt" },
  { value: "a navy blue crewneck sweater over a white collared shirt", label: "Navy Sweater" },
  { value: "a sleek black turtleneck", label: "Black Turtleneck" },
  { value: "a comfortable gray hoodie", label: "Gray Hoodie" },
  { value: "a casual but professional light jacket", label: "Light Jacket" },
  { value: "a modern blazer with a casual t-shirt underneath", label: "Blazer & T-Shirt" },
  { value: "a smart casual button-up shirt", label: "Casual Button-Up" },
  { value: "a clean white medical coat over professional attire", label: "Medical Coat" },
  { value: "a tweed blazer with elbow patches over a button-up", label: "Academic Blazer" },
];

export const LOCATION_OPTIONS = [
  { value: "in a modern corporate office with floor-to-ceiling windows", label: "Modern Office" },
  { value: "in front of a clean white studio backdrop", label: "White Studio" },
  { value: "in an elegant executive office with dark wood furnishings", label: "Executive Office" },
  { value: "in a modern startup office with plants", label: "Startup Office" },
  { value: "in a bright minimalist studio", label: "Minimalist Studio" },
  { value: "against a clean minimalist white wall", label: "White Wall" },
  { value: "in a modern tech office with exposed brick", label: "Tech Office" },
  { value: "outdoors in a lush green park with soft bokeh background", label: "Park / Outdoors" },
  { value: "on a city rooftop with blurred skyline", label: "City Rooftop" },
  { value: "outdoors with warm sunset colors in the background", label: "Sunset Background" },
  { value: "in a distinguished library with bookshelves", label: "Library" },
  { value: "in an upscale financial office", label: "Financial Office" },
];

export const LIGHTING_OPTIONS = [
  { value: "soft natural daylight", label: "Natural Daylight" },
  { value: "professional studio lighting with soft shadows", label: "Studio Lighting" },
  { value: "dramatic side lighting", label: "Dramatic Side Light" },
  { value: "bright natural window light", label: "Window Light" },
  { value: "soft diffused natural light", label: "Diffused Natural" },
  { value: "warm ambient lighting", label: "Warm Ambient" },
  { value: "golden hour warm sunlight", label: "Golden Hour" },
  { value: "beautiful sunset golden hour light", label: "Sunset Light" },
  { value: "bright, clean clinical lighting", label: "Clean/Bright" },
];

// Preset styles (20 total — matches HEADSHOT_STYLES in nano-banana.ts)
// Preview images are served from /style-previews/{gender}/{id}.jpg
export const PRESET_STYLES: StyleConfig[] = [
  // === OUTDOOR & NATURAL (3) ===
  { id: "outdoor-natural", name: "Natural Light", category: "Outdoor & Natural", outfit: "a casual but professional light jacket", location: "outdoors in a lush green park with soft bokeh background", lighting: "golden hour warm sunlight", previewEmoji: "🌳" },
  { id: "outdoor-urban", name: "Urban Professional", category: "Outdoor & Natural", outfit: "a modern blazer with a casual t-shirt underneath", location: "on a city rooftop with blurred skyline", lighting: "beautiful sunset golden hour light", previewEmoji: "🏙️" },
  { id: "outdoor-sunset", name: "Golden Hour", category: "Outdoor & Natural", outfit: "a smart casual button-up shirt", location: "outdoors with warm sunset colors in the background", lighting: "beautiful golden sunset backlighting", previewEmoji: "🌅" },
  // === CORPORATE & BUSINESS (3) ===
  { id: "corporate-navy", name: "Corporate Navy", category: "Corporate & Business", outfit: "a tailored navy blue suit with a crisp white dress shirt", location: "in a modern corporate office with floor-to-ceiling windows", lighting: "soft natural daylight", previewEmoji: "🏢" },
  { id: "corporate-gray", name: "Corporate Gray", category: "Corporate & Business", outfit: "a charcoal gray business suit with a light blue tie", location: "in front of a clean white studio backdrop", lighting: "professional studio lighting with soft shadows", previewEmoji: "📸" },
  { id: "executive-black", name: "Executive Black", category: "Corporate & Business", outfit: "a sharp black suit with a white pocket square", location: "in an elegant executive office with dark wood furnishings", lighting: "dramatic side lighting", previewEmoji: "🖤" },
  // === BUSINESS CASUAL (3) ===
  { id: "casual-blue-shirt", name: "Blue Oxford", category: "Business Casual", outfit: "a light blue oxford button-up shirt with rolled sleeves", location: "in a modern startup office with plants", lighting: "bright natural window light", previewEmoji: "💙" },
  { id: "casual-white-shirt", name: "Business Casual White", category: "Business Casual", outfit: "a crisp white linen shirt, open collar", location: "in a bright minimalist studio", lighting: "soft diffused natural light", previewEmoji: "🤍" },
  { id: "smart-casual-sweater", name: "Smart Casual", category: "Business Casual", outfit: "a navy blue crewneck sweater over a white collared shirt", location: "in a cozy modern office space", lighting: "warm ambient lighting", previewEmoji: "🧶" },
  // === CREATIVE & MODERN (3) ===
  { id: "creative-turtleneck", name: "Creative Turtleneck", category: "Creative & Modern", outfit: "a sleek black turtleneck", location: "against a clean minimalist white wall", lighting: "dramatic studio lighting with strong contrast", previewEmoji: "🎨" },
  { id: "tech-startup", name: "Tech Startup", category: "Creative & Modern", outfit: "a comfortable gray hoodie", location: "in a modern tech office with exposed brick", lighting: "natural daylight mixed with cool LED", previewEmoji: "💻" },
  { id: "creative-neon", name: "Creative Neon", category: "Creative & Modern", outfit: "a fitted black crew-neck t-shirt", location: "in a dark studio with colorful neon light projections and geometric patterns cast across the face and background", lighting: "dramatic low-key lighting with vibrant neon pink, blue, and purple color gels creating cinematic color contrast", previewEmoji: "🎆" },
  // === STUDIO (2) ===
  { id: "classic-studio", name: "Classic Studio", category: "Studio", outfit: "a classic dark blazer over a clean white shirt", location: "in front of a seamless pure white studio backdrop", lighting: "soft even studio lighting with subtle fill light", previewEmoji: "📷" },
  { id: "warm-studio", name: "Warm Studio", category: "Studio", outfit: "a soft earth-tone cashmere sweater with a collared shirt underneath", location: "in front of a warm cream and soft beige textured backdrop", lighting: "warm golden studio lighting with gentle fill", previewEmoji: "☀️" },
  // === ARTISTIC (1) ===
  { id: "dark-dramatic", name: "Dark & Dramatic", category: "Artistic", outfit: "a dark tailored suit jacket over a black shirt", location: "against a deep charcoal gradient background fading to black", lighting: "dramatic Rembrandt lighting with a single key light from the side", previewEmoji: "🌑" },
  // === INDUSTRY (5) ===
  { id: "finance-exec", name: "Finance Executive", category: "Industry", outfit: "a premium pinstripe suit with silk tie", location: "in an upscale financial office", lighting: "professional office lighting", previewEmoji: "💼" },
  { id: "healthcare-pro", name: "Healthcare Pro", category: "Industry", outfit: "a clean white medical coat over professional attire", location: "in a modern medical facility", lighting: "bright, clean clinical lighting", previewEmoji: "🏥" },
  { id: "academic-scholar", name: "Academic", category: "Industry", outfit: "a tweed blazer with elbow patches over a button-up", location: "in a distinguished library with bookshelves", lighting: "warm ambient library lighting", previewEmoji: "📚" },
  { id: "legal-pro", name: "Legal Professional", category: "Industry", outfit: "a traditional dark suit with conservative tie", location: "in a distinguished law office with leather chairs", lighting: "classic office lighting", previewEmoji: "⚖️" },
  { id: "real-estate", name: "Real Estate Agent", category: "Industry", outfit: "a sharp fitted blazer over a professional button-up shirt", location: "in front of a bright modern home exterior with soft bokeh landscaping", lighting: "warm natural daylight", previewEmoji: "🏡" },
];

// Category configuration with emoji and "Recommended" tags
interface CategoryConfig {
  id: string;
  emoji: string;
  name: string;
  isRecommended?: boolean;
}

const CATEGORIES: Record<string, CategoryConfig> = {
  "Outdoor & Natural": { id: "outdoor-natural", emoji: "🌳", name: "Outdoor & Natural", isRecommended: true },
  "Corporate & Business": { id: "corporate-business", emoji: "🏢", name: "Corporate & Business" },
  "Business Casual": { id: "business-casual", emoji: "👔", name: "Business Casual" },
  "Creative & Modern": { id: "creative-modern", emoji: "🎨", name: "Creative & Modern" },
  "Studio": { id: "studio", emoji: "📸", name: "Studio" },
  "Artistic": { id: "artistic", emoji: "🌑", name: "Artistic" },
  "Industry": { id: "industry", emoji: "💼", name: "Industry" },
};

interface StyleSelectorProps {
  maxStyles: number;
  selectedStyles: SelectedStyle[];
  onStylesChange: (styles: SelectedStyle[]) => void;
  gender?: "male" | "female";
}

// Helper to get gender-aware preview image path
export function getPreviewImagePath(styleId: string, gender?: string): string | undefined {
  const g = gender || "male";
  return `/style-previews/${g}/${styleId}.jpg`;
}

export function StyleSelector({ maxStyles, selectedStyles, onStylesChange, gender }: StyleSelectorProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Reset failed images when gender changes (new image set to try)
  useEffect(() => {
    setFailedImages(new Set());
  }, [gender]);

  // Group styles by category
  const stylesByCategory = PRESET_STYLES.reduce((acc, style) => {
    if (!acc[style.category]) {
      acc[style.category] = [];
    }
    acc[style.category].push(style);
    return acc;
  }, {} as Record<string, StyleConfig[]>);

  // Handle style selection toggle
  const toggleStyle = (preset: StyleConfig) => {
    const isSelected = selectedStyles.some(s => s.id === preset.id);

    if (isSelected) {
      // Deselect
      onStylesChange(selectedStyles.filter(s => s.id !== preset.id));
    } else {
      // Select if under max
      const totalSelected = selectedStyles.reduce((sum, s) => sum + s.quantity, 0);
      if (totalSelected < maxStyles) {
        onStylesChange([
          ...selectedStyles,
          {
            id: preset.id,
            name: preset.name,
            outfit: preset.outfit,
            location: preset.location,
            lighting: preset.lighting,
            quantity: 1,
            previewImage: getPreviewImagePath(preset.id, gender),
          },
        ]);
      }
    }
  };

  // Render category section
  const renderCategory = (categoryName: string, styles: StyleConfig[]) => {
    const config = CATEGORIES[categoryName];
    if (!config) return null;

    return (
      <div key={categoryName} className="space-y-3">
        {/* Category header */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xl">{config.emoji}</span>
          <h3 className="font-bold text-gray-900">{categoryName}</h3>
          {config.isRecommended && (
            <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Recommended
            </span>
          )}
        </div>

        {/* Style cards grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {styles.map((style) => {
            const isSelected = selectedStyles.some(s => s.id === style.id);

            return (
              <button
                key={style.id}
                onClick={() => toggleStyle(style)}
                className={`relative group transition-all duration-200 ${
                  isSelected
                    ? "ring-4 ring-offset-2 ring-sky-500"
                    : "border-2 border-transparent hover:border-gray-200"
                }`}
              >
                {/* Card container */}
                <div className="bg-white rounded-xl overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors">
                  {/* Image container - 3:4 aspect ratio */}
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    {!failedImages.has(style.id) ? (
                      <img
                        src={getPreviewImagePath(style.id, gender)}
                        alt={style.name}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setFailedImages((prev) => new Set(prev).add(style.id))
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-3xl">
                        {style.previewEmoji}
                      </div>
                    )}

                    {/* Checkmark overlay - only shown when selected */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-md">
                        <Check className="h-5 w-5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Style name */}
                  <div className="px-2 py-2">
                    <p className="text-xs font-medium text-gray-900 text-center line-clamp-2">
                      {style.name}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Ordered categories */}
      {[
        "Outdoor & Natural",
        "Corporate & Business",
        "Business Casual",
        "Creative & Modern",
        "Studio",
        "Artistic",
        "Industry",
      ]
        .filter((cat) => stylesByCategory[cat]?.length > 0)
        .map((cat) => renderCategory(cat, stylesByCategory[cat]))}
    </div>
  );
}

// All exports are inline (export const) above
