"use client";

import { useState } from "react";
import { CheckCircle2, Plus, Minus, Sparkles } from "lucide-react";
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
  // Outdoor & Natural
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
  const [customOutfit, setCustomOutfit] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customLighting, setCustomLighting] = useState("");

  // Get remaining images to allocate
  const allocatedImages = selectedStyles.reduce((sum, s) => sum + s.quantity, 0);
  const remainingImages = totalImages - allocatedImages;

  // Toggle style selection
  const toggleStyle = (preset: StyleConfig) => {
    const existing = selectedStyles.find(s => s.id === preset.id);

    if (existing) {
      onStylesChange(selectedStyles.filter(s => s.id !== preset.id));
    } else {
      const newStyle: SelectedStyle = {
        id: preset.id,
        name: preset.name,
        outfit: preset.outfit,
        location: preset.location,
        lighting: preset.lighting,
        quantity: Math.min(1, remainingImages),
      };
      if (remainingImages > 0) {
        onStylesChange([...selectedStyles, newStyle]);
      }
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
    if (remainingImages <= 0) return;
    if (!customOutfit && !customLocation && !customLighting) return;

    const customId = `custom-${Date.now()}`;
    const newStyle: SelectedStyle = {
      id: customId,
      name: "Custom Style",
      outfit: customOutfit || OUTFIT_OPTIONS[0].value,
      location: customLocation || LOCATION_OPTIONS[0].value,
      lighting: customLighting || LIGHTING_OPTIONS[0].value,
      quantity: Math.min(1, remainingImages),
      isCustom: true,
      customPrompt: `${customOutfit}, ${customLocation}, ${customLighting}`.trim(),
    };
    onStylesChange([...selectedStyles, newStyle]);
    setCustomOutfit("");
    setCustomLocation("");
    setCustomLighting("");
  };

  // Dropdown component for consistent styling
  const StyleDropdown = ({
    label,
    value,
    options,
    onChange
  }: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }) => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  // Quantity controls component
  const QuantityControls = ({
    quantity,
    onDecrease,
    onIncrease,
    canIncrease
  }: {
    quantity: number;
    onDecrease: () => void;
    onIncrease: () => void;
    canIncrease: boolean;
  }) => (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onDecrease}
        className="w-8 h-8 rounded-full border-2 border-blue-400 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="text-base font-semibold text-gray-900 w-8 text-center">×{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={!canIncrease}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
          canIncrease
            ? "border-blue-400 text-blue-600 hover:bg-blue-50"
            : "border-gray-200 text-gray-300 cursor-not-allowed"
        }`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Allocation summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-semibold text-gray-900">Image Allocation</p>
            <p className="text-sm text-gray-600">
              {allocatedImages} of {totalImages} assigned
              {remainingImages > 0 && <span className="text-blue-600 font-medium ml-1">({remainingImages} remaining)</span>}
            </p>
          </div>
          {selectedStyles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedStyles.map(s => (
                <Badge key={s.id} variant="secondary" className="bg-white border border-gray-200">
                  {s.name} ×{s.quantity}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Style cards - 3 column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESET_STYLES.map(preset => {
          const selected = selectedStyles.find(s => s.id === preset.id);
          const isSelected = !!selected;

          return (
            <div
              key={preset.id}
              className={`rounded-2xl border-2 transition-all overflow-hidden bg-gradient-to-br from-orange-50/60 to-amber-50/40 ${
                isSelected
                  ? "border-blue-500 shadow-lg ring-2 ring-blue-100"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="p-4 flex gap-4">
                {/* Preview image - left side */}
                <div
                  className="w-28 h-36 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => toggleStyle(preset)}
                >
                  {preset.previewImage ? (
                    <img
                      src={preset.previewImage}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
                      {preset.previewEmoji}
                    </div>
                  )}
                </div>

                {/* Right side - name + dropdowns */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Header: name + checkmark */}
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className="font-bold text-gray-900 text-lg cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => toggleStyle(preset)}
                    >
                      {preset.name}
                    </h3>
                    {isSelected && (
                      <CheckCircle2 className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Dropdowns */}
                  <div className="space-y-2 flex-1">
                    <StyleDropdown
                      label="Outfit"
                      value={selected?.outfit || preset.outfit}
                      options={OUTFIT_OPTIONS}
                      onChange={(value) => {
                        if (selected) {
                          updateStyle(preset.id, { outfit: value });
                        } else if (remainingImages > 0) {
                          onStylesChange([...selectedStyles, {
                            id: preset.id,
                            name: preset.name,
                            outfit: value,
                            location: preset.location,
                            lighting: preset.lighting,
                            quantity: 1,
                          }]);
                        }
                      }}
                    />
                    <StyleDropdown
                      label="Location"
                      value={selected?.location || preset.location}
                      options={LOCATION_OPTIONS}
                      onChange={(value) => {
                        if (selected) {
                          updateStyle(preset.id, { location: value });
                        } else if (remainingImages > 0) {
                          onStylesChange([...selectedStyles, {
                            id: preset.id,
                            name: preset.name,
                            outfit: preset.outfit,
                            location: value,
                            lighting: preset.lighting,
                            quantity: 1,
                          }]);
                        }
                      }}
                    />
                    <StyleDropdown
                      label="Lighting"
                      value={selected?.lighting || preset.lighting}
                      options={LIGHTING_OPTIONS}
                      onChange={(value) => {
                        if (selected) {
                          updateStyle(preset.id, { lighting: value });
                        } else if (remainingImages > 0) {
                          onStylesChange([...selectedStyles, {
                            id: preset.id,
                            name: preset.name,
                            outfit: preset.outfit,
                            location: preset.location,
                            lighting: value,
                            quantity: 1,
                          }]);
                        }
                      }}
                    />
                  </div>

                  {/* Quantity controls - bottom */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <QuantityControls
                      quantity={selected?.quantity || 0}
                      onDecrease={() => {
                        if (selected && selected.quantity > 1) {
                          updateStyle(preset.id, { quantity: selected.quantity - 1 });
                        } else if (selected) {
                          onStylesChange(selectedStyles.filter(s => s.id !== preset.id));
                        }
                      }}
                      onIncrease={() => {
                        if (selected && remainingImages > 0) {
                          updateStyle(preset.id, { quantity: selected.quantity + 1 });
                        } else if (!selected && remainingImages > 0) {
                          onStylesChange([...selectedStyles, {
                            id: preset.id,
                            name: preset.name,
                            outfit: preset.outfit,
                            location: preset.location,
                            lighting: preset.lighting,
                            quantity: 1,
                          }]);
                        }
                      }}
                      canIncrease={remainingImages > 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom style card - same format with blank fields */}
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-purple-50/40 to-pink-50/40 hover:border-purple-400 transition-all">
          <div className="p-4 flex gap-4">
            {/* Blank preview area */}
            <div className="w-28 h-36 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0 flex items-center justify-center shadow-sm">
              <Sparkles className="h-10 w-10 text-purple-400" />
            </div>

            {/* Right side - same format */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-lg">Custom Style</h3>
              </div>

              {/* Blank dropdowns for custom */}
              <div className="space-y-2 flex-1">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Outfit</label>
                  <select
                    value={customOutfit}
                    onChange={(e) => setCustomOutfit(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select outfit...</option>
                    {OUTFIT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Location</label>
                  <select
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select location...</option>
                    {LOCATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Lighting</label>
                  <select
                    value={customLighting}
                    onChange={(e) => setCustomLighting(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select lighting...</option>
                    {LIGHTING_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add button */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={addCustomStyle}
                  disabled={remainingImages <= 0 || (!customOutfit && !customLocation && !customLighting)}
                  className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
                    remainingImages > 0 && (customOutfit || customLocation || customLighting)
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add Custom Style
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles that have been added */}
      {selectedStyles.filter(s => s.isCustom).map(custom => (
        <div key={custom.id} className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Custom Style</span>
              <span className="text-sm text-purple-600">
                ({OUTFIT_OPTIONS.find(o => o.value === custom.outfit)?.label || "Custom"})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <QuantityControls
                quantity={custom.quantity}
                onDecrease={() => {
                  if (custom.quantity > 1) {
                    updateStyle(custom.id, { quantity: custom.quantity - 1 });
                  } else {
                    onStylesChange(selectedStyles.filter(s => s.id !== custom.id));
                  }
                }}
                onIncrease={() => {
                  if (remainingImages > 0) {
                    updateStyle(custom.id, { quantity: custom.quantity + 1 });
                  }
                }}
                canIncrease={remainingImages > 0}
              />
              <button
                onClick={() => onStylesChange(selectedStyles.filter(s => s.id !== custom.id))}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
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
