"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Plus, Minus, Sparkles, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Style configuration with customizable variables
export interface StyleConfig {
  id: string;
  name: string;
  category: string;
  outfit: string;
  location: string;
  lighting: string;
  previewEmoji: string;
  previewImage?: string; // URL to preview image
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
}

// Dropdown options for customization
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

// Preset styles with default configurations
const PRESET_STYLES: StyleConfig[] = [
  // Outdoor & Natural (Recommended)
  { id: "outdoor-natural", name: "Natural Light", category: "Outdoor & Natural", outfit: "a casual but professional light jacket", location: "outdoors in a lush green park with soft bokeh background", lighting: "golden hour warm sunlight", previewEmoji: "🌳", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/5c3330ae-7f62-49e3-99bf-153edfb3572d-outdoor-natural-v1.jpg" },
  { id: "outdoor-urban", name: "Urban Professional", category: "Outdoor & Natural", outfit: "a modern blazer with a casual t-shirt underneath", location: "on a city rooftop with blurred skyline", lighting: "beautiful sunset golden hour light", previewEmoji: "🏙️", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/902349f2-4bc9-4037-b9a7-8e6e1ccba629-outdoor-urban-v1.jpg" },
  { id: "outdoor-sunset", name: "Golden Hour", category: "Outdoor & Natural", outfit: "a smart casual button-up shirt", location: "outdoors with warm sunset colors in the background", lighting: "beautiful sunset golden hour light", previewEmoji: "🌅", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/7b4aa176-f65d-4790-ae21-3546cc20bb70-outdoor-sunset-v1.jpg" },

  // Corporate & Business
  { id: "corporate-navy", name: "Corporate Navy", category: "Corporate", outfit: "a tailored navy blue suit with a crisp white dress shirt", location: "in a modern corporate office with floor-to-ceiling windows", lighting: "soft natural daylight", previewEmoji: "🏢", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/e5f47490-0ae4-483a-b934-b1bc4c3c6b21-corporate-navy-v1.jpg" },
  { id: "corporate-gray", name: "Corporate Gray", category: "Corporate", outfit: "a charcoal gray business suit with a light blue tie", location: "in front of a clean white studio backdrop", lighting: "professional studio lighting with soft shadows", previewEmoji: "📸", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/d50d9d23-3ce1-48bd-a186-7817052c7802-corporate-gray-v1.jpg" },
  { id: "executive-black", name: "Executive Black", category: "Corporate", outfit: "a sharp black suit with a white pocket square", location: "in an elegant executive office with dark wood furnishings", lighting: "dramatic side lighting", previewEmoji: "🖤", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/ce8c8be2-2223-4bbb-ac3f-d75d325bf724-executive-black-v1.jpg" },

  // Business Casual
  { id: "casual-blue-shirt", name: "Blue Oxford", category: "Business Casual", outfit: "a light blue oxford button-up shirt with rolled sleeves", location: "in a modern startup office with plants", lighting: "bright natural window light", previewEmoji: "💙", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/29806279-05a5-4e96-93df-a89765d003f4-casual-blue-shirt-v1.jpg" },

  // Creative & Modern
  { id: "tech-startup", name: "Tech Startup", category: "Creative", outfit: "a comfortable gray hoodie", location: "in a modern tech office with exposed brick", lighting: "bright natural window light", previewEmoji: "💻", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/6053feda-8624-43cc-92a8-8417e3be6178-tech-startup-v1.jpg" },

  // Industry Specific
  { id: "finance-exec", name: "Finance Executive", category: "Industry", outfit: "a charcoal gray business suit with a light blue tie", location: "in an upscale financial office", lighting: "professional studio lighting with soft shadows", previewEmoji: "💼", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/2a6b32e0-4c97-4fd5-966d-375a2c5aa901-finance-exec-v1.jpg" },
];

interface StyleSelectorProps {
  totalImages: number;
  selectedStyles: SelectedStyle[];
  onStylesChange: (styles: SelectedStyle[]) => void;
}

export function StyleSelector({ totalImages, selectedStyles, onStylesChange }: StyleSelectorProps) {
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  // Get remaining images to allocate
  const allocatedImages = selectedStyles.reduce((sum, s) => sum + s.quantity, 0);
  const remainingImages = totalImages - allocatedImages;

  // Toggle style selection
  const toggleStyle = (preset: StyleConfig) => {
    const existing = selectedStyles.find(s => s.id === preset.id);

    if (existing) {
      // Remove style
      onStylesChange(selectedStyles.filter(s => s.id !== preset.id));
      if (expandedStyle === preset.id) setExpandedStyle(null);
    } else {
      // Add style with default quantity
      const defaultQty = Math.max(1, Math.min(remainingImages, Math.ceil(remainingImages / 3)));
      const newStyle: SelectedStyle = {
        id: preset.id,
        name: preset.name,
        outfit: preset.outfit,
        location: preset.location,
        lighting: preset.lighting,
        quantity: defaultQty,
      };
      onStylesChange([...selectedStyles, newStyle]);
      setExpandedStyle(preset.id);
    }
  };

  // Update style configuration
  const updateStyle = (id: string, updates: Partial<SelectedStyle>) => {
    onStylesChange(selectedStyles.map(s =>
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  // Add custom style
  const addCustomStyle = () => {
    if (!customPrompt.trim() || remainingImages <= 0) return;

    const customId = `custom-${Date.now()}`;
    const newStyle: SelectedStyle = {
      id: customId,
      name: "Custom Style",
      outfit: customPrompt,
      location: "",
      lighting: "",
      quantity: Math.min(remainingImages, 2),
      isCustom: true,
      customPrompt: customPrompt,
    };
    onStylesChange([...selectedStyles, newStyle]);
    setCustomPrompt("");
    setExpandedStyle(customId);
  };

  // Group presets by category
  const categories = [
    { name: "🌿 Outdoor & Natural", recommended: true, styles: PRESET_STYLES.filter(s => s.category === "Outdoor & Natural") },
    { name: "👔 Corporate", styles: PRESET_STYLES.filter(s => s.category === "Corporate") },
    { name: "👕 Business Casual", styles: PRESET_STYLES.filter(s => s.category === "Business Casual") },
    { name: "🎨 Creative", styles: PRESET_STYLES.filter(s => s.category === "Creative") },
    { name: "🏥 Industry", styles: PRESET_STYLES.filter(s => s.category === "Industry") },
  ];

  return (
    <div className="space-y-6">
      {/* Allocation summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Image Allocation</p>
            <p className="text-sm text-gray-600">
              {allocatedImages} of {totalImages} images assigned
              {remainingImages > 0 && <span className="text-blue-600 ml-1">({remainingImages} remaining)</span>}
            </p>
          </div>
          {selectedStyles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedStyles.map(s => (
                <Badge key={s.id} variant="secondary" className="bg-white">
                  {s.name} ×{s.quantity}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Style categories */}
      {categories.map(category => (
        <div key={category.name} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            {category.recommended && (
              <Badge className="bg-green-500 text-white text-xs">Best Results</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.styles.map(preset => {
              const selected = selectedStyles.find(s => s.id === preset.id);
              const isExpanded = expandedStyle === preset.id;

              return (
                <div
                  key={preset.id}
                  className={`relative rounded-xl border-2 transition-all overflow-hidden ${
                    selected
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 bg-white"
                  }`}
                >
                  {/* Main card - clickable */}
                  <div
                    className="p-3 cursor-pointer"
                    onClick={() => toggleStyle(preset)}
                  >
                    <div className="flex gap-3">
                      {/* Preview image or emoji */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {preset.previewImage ? (
                          <img
                            src={preset.previewImage}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            {preset.previewEmoji}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{preset.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {OUTFIT_OPTIONS.find(o => o.value === preset.outfit)?.label || "Custom"} • {LOCATION_OPTIONS.find(l => l.value === preset.location)?.label || "Custom"}
                        </p>
                      </div>

                      {/* Selection indicator */}
                      {selected && (
                        <div className="flex items-center gap-1">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            ×{selected.quantity}
                          </span>
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expand/collapse toggle */}
                  {selected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedStyle(isExpanded ? null : preset.id);
                      }}
                      className="w-full py-2 px-3 bg-blue-100 text-blue-700 text-sm flex items-center justify-center gap-1 hover:bg-blue-200"
                    >
                      <PenLine className="h-3 w-3" />
                      {isExpanded ? "Hide options" : "Customize"}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}

                  {/* Expanded customization panel */}
                  {selected && isExpanded && (
                    <div className="p-3 bg-white border-t border-blue-200 space-y-3">
                      {/* Quantity */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Quantity</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStyle(preset.id, { quantity: Math.max(1, selected.quantity - 1) })}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            disabled={selected.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{selected.quantity}</span>
                          <button
                            onClick={() => updateStyle(preset.id, { quantity: Math.min(selected.quantity + 1, selected.quantity + remainingImages) })}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            disabled={remainingImages <= 0}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Outfit dropdown */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Outfit</label>
                        <select
                          value={selected.outfit}
                          onChange={(e) => updateStyle(preset.id, { outfit: e.target.value })}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
                        >
                          {OUTFIT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Location dropdown */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Location</label>
                        <select
                          value={selected.location}
                          onChange={(e) => updateStyle(preset.id, { location: e.target.value })}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
                        >
                          {LOCATION_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Lighting dropdown */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Lighting</label>
                        <select
                          value={selected.lighting}
                          onChange={(e) => updateStyle(preset.id, { lighting: e.target.value })}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
                        >
                          {LIGHTING_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom style input */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-purple-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 mb-1">Custom Style</p>
            <p className="text-xs text-gray-500 mb-2">Describe what you want (e.g., "Blue blazer, outdoor cafe, morning light")</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe your ideal headshot..."
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2"
                onKeyDown={(e) => e.key === "Enter" && addCustomStyle()}
              />
              <Button
                onClick={addCustomStyle}
                disabled={!customPrompt.trim() || remainingImages <= 0}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles list */}
      {selectedStyles.filter(s => s.isCustom).map(custom => (
        <div key={custom.id} className="bg-purple-50 border-2 border-purple-300 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-900">Custom: "{custom.customPrompt}"</span>
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">×{custom.quantity}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateStyle(custom.id, { quantity: Math.max(1, custom.quantity - 1) })}
                className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center hover:bg-purple-300"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                onClick={() => updateStyle(custom.id, { quantity: custom.quantity + 1 })}
                className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center hover:bg-purple-300"
                disabled={remainingImages <= 0}
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => onStylesChange(selectedStyles.filter(s => s.id !== custom.id))}
                className="text-red-500 hover:text-red-700 text-sm ml-2"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { PRESET_STYLES, OUTFIT_OPTIONS, LOCATION_OPTIONS, LIGHTING_OPTIONS };
