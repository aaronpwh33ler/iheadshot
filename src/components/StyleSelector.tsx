"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
const OUTFIT_OPTIONS = [
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

const LOCATION_OPTIONS = [
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

const LIGHTING_OPTIONS = [
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
const PRESET_STYLES: StyleConfig[] = [
  // === OUTDOOR (3) ===
  { id: "outdoor-natural", name: "Natural Light", category: "Outdoor", outfit: "a casual but professional light jacket", location: "outdoors in a lush green park with soft bokeh background", lighting: "golden hour warm sunlight", previewEmoji: "🌳" },
  { id: "outdoor-urban", name: "Urban Professional", category: "Outdoor", outfit: "a modern blazer with a casual t-shirt underneath", location: "on a city rooftop with blurred skyline", lighting: "beautiful sunset golden hour light", previewEmoji: "🏙️" },
  { id: "outdoor-sunset", name: "Golden Hour", category: "Outdoor", outfit: "a smart casual button-up shirt", location: "outdoors with warm sunset colors in the background", lighting: "beautiful golden sunset backlighting", previewEmoji: "🌅" },
  // === CORPORATE (3) ===
  { id: "corporate-navy", name: "Corporate Navy", category: "Corporate", outfit: "a tailored navy blue suit with a crisp white dress shirt", location: "in a modern corporate office with floor-to-ceiling windows", lighting: "soft natural daylight", previewEmoji: "🏢" },
  { id: "corporate-gray", name: "Corporate Gray", category: "Corporate", outfit: "a charcoal gray business suit with a light blue tie", location: "in front of a clean white studio backdrop", lighting: "professional studio lighting with soft shadows", previewEmoji: "📸" },
  { id: "executive-black", name: "Executive Black", category: "Corporate", outfit: "a sharp black suit with a white pocket square", location: "in an elegant executive office with dark wood furnishings", lighting: "dramatic side lighting", previewEmoji: "🖤" },
  // === CASUAL (3) ===
  { id: "casual-blue-shirt", name: "Blue Oxford", category: "Casual", outfit: "a light blue oxford button-up shirt with rolled sleeves", location: "in a modern startup office with plants", lighting: "bright natural window light", previewEmoji: "💙" },
  { id: "casual-white-shirt", name: "Business Casual White", category: "Casual", outfit: "a crisp white linen shirt, open collar", location: "in a bright minimalist studio", lighting: "soft diffused natural light", previewEmoji: "🤍" },
  { id: "smart-casual-sweater", name: "Smart Casual", category: "Casual", outfit: "a navy blue crewneck sweater over a white collared shirt", location: "in a cozy modern office space", lighting: "warm ambient lighting", previewEmoji: "🧶" },
  // === CREATIVE (3) ===
  { id: "creative-turtleneck", name: "Creative Turtleneck", category: "Creative", outfit: "a sleek black turtleneck", location: "against a clean minimalist white wall", lighting: "dramatic studio lighting with strong contrast", previewEmoji: "🎨" },
  { id: "tech-startup", name: "Tech Startup", category: "Creative", outfit: "a comfortable gray hoodie", location: "in a modern tech office with exposed brick", lighting: "natural daylight mixed with cool LED", previewEmoji: "💻" },
  { id: "creative-neon", name: "Creative Neon", category: "Creative", outfit: "a fitted black crew-neck t-shirt", location: "in a dark studio with colorful neon light projections and geometric patterns cast across the face and background", lighting: "dramatic low-key lighting with vibrant neon pink, blue, and purple color gels creating cinematic color contrast", previewEmoji: "🎆" },
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

interface StyleSelectorProps {
  totalImages: number;
  selectedStyles: SelectedStyle[];
  onStylesChange: (styles: SelectedStyle[]) => void;
  gender?: "male" | "female";
}

// Helper to get gender-aware preview image path
function getPreviewImagePath(styleId: string, gender?: string): string | undefined {
  const g = gender || "male";
  return `/style-previews/${g}/${styleId}.jpg`;
}

export function StyleSelector({ totalImages, selectedStyles, onStylesChange, gender }: StyleSelectorProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Reset failed images when gender changes (new image set to try)
  useEffect(() => {
    setFailedImages(new Set());
  }, [gender]);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [customOutfit, setCustomOutfit] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customLighting, setCustomLighting] = useState("");

  // Get allocated count
  const allocatedImages = selectedStyles.reduce((sum, s) => sum + s.quantity, 0);
  const remainingImages = totalImages - allocatedImages;
  const progressPercent = (allocatedImages / totalImages) * 100;

  // Add or increment style (for presets only - they consolidate)
  const addStyle = (preset: StyleConfig) => {
    if (remainingImages <= 0) return;

    const existing = selectedStyles.find(s => s.id === preset.id);
    if (existing) {
      // Increment quantity
      onStylesChange(selectedStyles.map(s =>
        s.id === preset.id ? { ...s, quantity: s.quantity + 1 } : s
      ));
    } else {
      // Add new
      onStylesChange([...selectedStyles, {
        id: preset.id,
        name: preset.name,
        outfit: preset.outfit,
        location: preset.location,
        lighting: preset.lighting,
        quantity: 1,
        previewImage: getPreviewImagePath(preset.id, gender),
      }]);
    }
  };

  // Add a NEW custom card (each one is unique, never consolidates)
  const addCustomStyle = () => {
    if (remainingImages <= 0) return;

    const customId = `custom-${Date.now()}`;
    onStylesChange([...selectedStyles, {
      id: customId,
      name: "Custom",
      outfit: OUTFIT_OPTIONS[0].value,
      location: LOCATION_OPTIONS[0].value,
      lighting: LIGHTING_OPTIONS[0].value,
      quantity: 1,
      isCustom: true,
    }]);
    // Open edit modal for this new custom
    setEditingCustomId(customId);
    setCustomOutfit(OUTFIT_OPTIONS[0].value);
    setCustomLocation(LOCATION_OPTIONS[0].value);
    setCustomLighting(LIGHTING_OPTIONS[0].value);
  };

  // Edit an existing custom card
  const editCustomStyle = (style: SelectedStyle) => {
    setEditingCustomId(style.id);
    setCustomOutfit(style.outfit);
    setCustomLocation(style.location);
    setCustomLighting(style.lighting);
  };

  // Save custom edits
  const saveCustomEdits = () => {
    if (!editingCustomId) return;
    onStylesChange(selectedStyles.map(s =>
      s.id === editingCustomId
        ? { ...s, outfit: customOutfit, location: customLocation, lighting: customLighting }
        : s
    ));
    setEditingCustomId(null);
  };

  // Cancel custom edits
  const cancelCustomEdits = () => {
    setEditingCustomId(null);
  };

  // Remove custom card
  const removeCustomStyle = (id: string) => {
    onStylesChange(selectedStyles.filter(s => s.id !== id));
    if (editingCustomId === id) {
      setEditingCustomId(null);
    }
  };

  // Decrement or remove style
  const decrementStyle = (id: string) => {
    const existing = selectedStyles.find(s => s.id === id);
    if (!existing) return;

    if (existing.quantity <= 1) {
      onStylesChange(selectedStyles.filter(s => s.id !== id));
    } else {
      onStylesChange(selectedStyles.map(s =>
        s.id === id ? { ...s, quantity: s.quantity - 1 } : s
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Images Selected</span>
          <span className="text-sm font-bold text-gray-900">{allocatedImages} / {totalImages}</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        {remainingImages > 0 && (
          <p className="text-xs text-gray-500 mt-2">{remainingImages} more to allocate</p>
        )}
        {remainingImages === 0 && (
          <p className="text-xs text-green-600 mt-2 font-medium">✓ All images allocated!</p>
        )}
      </div>

      {/* Two column layout - 1/3 presets, 2/3 selected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Style Presets (1/3 width) */}
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 lg:col-span-1">
          <h3 className="text-base font-semibold text-gray-700 mb-3 px-1">Style Presets</h3>
          <div className="space-y-2 max-h-[480px] overflow-y-scroll pr-2">
            {PRESET_STYLES.map(preset => {
              const isSelected = selectedStyles.some(s => s.id === preset.id);
              return (
                <div
                  key={preset.id}
                  className={`bg-white rounded-lg border-2 p-2 flex items-center gap-3 transition-all ${
                    isSelected ? "border-brand-300 bg-brand-50/50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Preview image — gender-aware with emoji fallback */}
                  <div className="w-14 h-[72px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                    {!failedImages.has(preset.id) ? (
                      <img
                        src={getPreviewImagePath(preset.id, gender)}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        onError={() => setFailedImages(prev => new Set(prev).add(preset.id))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                        {preset.previewEmoji}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{preset.category}</p>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => addStyle(preset)}
                    disabled={remainingImages <= 0}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      remainingImages > 0
                        ? "bg-brand-500 text-white hover:bg-brand-600 hover:scale-110 shadow-md"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {/* Custom card at the bottom */}
            <div className="bg-white rounded-lg border-2 border-dashed border-brand-300 p-2 flex items-center gap-3 transition-all hover:border-brand-400 hover:bg-brand-50/50">
              {/* Custom preview - sparkles on light bg */}
              <div className="w-14 h-[72px] rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 flex-shrink-0 flex items-center justify-center shadow-sm">
                <div className="relative">
                  <Sparkles className="h-6 w-6 text-brand-500" />
                  <Sparkles className="h-3 w-3 text-brand-300 absolute -top-1 -right-0.5" />
                  <Sparkles className="h-2 w-2 text-brand-400 absolute -bottom-0.5 -left-1" />
                </div>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">Custom</h4>
                <p className="text-xs text-gray-500 mt-0.5">Create your own</p>
              </div>

              {/* Add button */}
              <button
                onClick={addCustomStyle}
                disabled={remainingImages <= 0}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  remainingImages > 0
                    ? "bg-brand-500 text-white hover:bg-brand-600 hover:scale-110 shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Selected Styles (2/3 width) */}
        <div className="bg-brand-50 rounded-2xl p-3 border border-brand-200 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-700 mb-3 px-1">Selected Styles</h3>
          {selectedStyles.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 text-center h-[440px] flex flex-col items-center justify-center">
              <p className="text-gray-500">Click + to add styles</p>
              <p className="text-sm text-gray-400 mt-1">Your selections will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-[480px] overflow-y-scroll pr-2 pt-2">
              {selectedStyles.map(style => (
                <div
                  key={style.id}
                  className="bg-white rounded-lg border-2 border-brand-400 p-2 shadow-md relative"
                >
                  {/* Quantity badge - only for presets */}
                  {!style.isCustom && (
                    <div className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-md z-10">
                      x{style.quantity}
                    </div>
                  )}

                  {/* Preview image — gender-aware */}
                  <div className="w-full aspect-[3/4] rounded-md overflow-hidden bg-gray-100 mb-1.5 shadow-sm">
                    {style.isCustom ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
                        <div className="relative">
                          <Sparkles className="h-8 w-8 text-brand-500" />
                          <Sparkles className="h-4 w-4 text-brand-300 absolute -top-2 -right-1" />
                          <Sparkles className="h-3 w-3 text-brand-400 absolute -bottom-1 -left-2" />
                        </div>
                      </div>
                    ) : !failedImages.has(style.id) ? (
                      <img
                        src={getPreviewImagePath(style.id, gender)}
                        alt={style.name}
                        className="w-full h-full object-cover"
                        onError={() => setFailedImages(prev => new Set(prev).add(style.id))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-gray-100 to-gray-200">
                        {PRESET_STYLES.find(p => p.id === style.id)?.previewEmoji || "✨"}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h4 className="font-semibold text-gray-900 text-xs text-center mb-1.5">{style.name}</h4>

                  {/* Controls - different for custom vs preset */}
                  {style.isCustom ? (
                    // Custom card: Edit and Remove buttons
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => editCustomStyle(style)}
                        className="flex-1 py-1.5 px-2 bg-brand-500 text-white text-xs font-medium rounded-md hover:bg-brand-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeCustomStyle(style.id)}
                        className="w-7 h-7 rounded-md border-2 border-gray-300 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    // Preset card: +/- controls
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => decrementStyle(style.id)}
                        className="w-7 h-7 rounded-full border-2 border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => addStyle(PRESET_STYLES.find(p => p.id === style.id)!)}
                        disabled={remainingImages <= 0}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          remainingImages > 0
                            ? "border-2 border-brand-400 text-brand-600 hover:bg-brand-50"
                            : "border-2 border-gray-200 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Custom Modal */}
      {editingCustomId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-500" />
              Customize Your Style
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Outfit</label>
                <select
                  value={customOutfit}
                  onChange={(e) => setCustomOutfit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  {OUTFIT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                <select
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  {LOCATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Lighting</label>
                <select
                  value={customLighting}
                  onChange={(e) => setCustomLighting(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  {LIGHTING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelCustomEdits}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCustomEdits}
                className="flex-1 py-2 px-4 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { PRESET_STYLES, OUTFIT_OPTIONS, LOCATION_OPTIONS, LIGHTING_OPTIONS };
