"use client";

import { useState } from "react";
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

// Preset styles
const PRESET_STYLES: StyleConfig[] = [
  { id: "outdoor-natural", name: "Natural Light", category: "Outdoor", outfit: "a casual but professional light jacket", location: "outdoors in a lush green park with soft bokeh background", lighting: "golden hour warm sunlight", previewEmoji: "🌳", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/5c3330ae-7f62-49e3-99bf-153edfb3572d-outdoor-natural-v1.jpg" },
  { id: "outdoor-urban", name: "Urban Professional", category: "Outdoor", outfit: "a modern blazer with a casual t-shirt underneath", location: "on a city rooftop with blurred skyline", lighting: "beautiful sunset golden hour light", previewEmoji: "🏙️", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/902349f2-4bc9-4037-b9a7-8e6e1ccba629-outdoor-urban-v1.jpg" },
  { id: "outdoor-sunset", name: "Golden Hour", category: "Outdoor", outfit: "a smart casual button-up shirt", location: "outdoors with warm sunset colors in the background", lighting: "beautiful sunset golden hour light", previewEmoji: "🌅", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/7b4aa176-f65d-4790-ae21-3546cc20bb70-outdoor-sunset-v1.jpg" },
  { id: "corporate-navy", name: "Corporate Navy", category: "Corporate", outfit: "a tailored navy blue suit with a crisp white dress shirt", location: "in a modern corporate office with floor-to-ceiling windows", lighting: "soft natural daylight", previewEmoji: "🏢", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/e5f47490-0ae4-483a-b934-b1bc4c3c6b21-corporate-navy-v1.jpg" },
  { id: "corporate-gray", name: "Corporate Gray", category: "Corporate", outfit: "a charcoal gray business suit with a light blue tie", location: "in front of a clean white studio backdrop", lighting: "professional studio lighting with soft shadows", previewEmoji: "📸", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/d50d9d23-3ce1-48bd-a186-7817052c7802-corporate-gray-v1.jpg" },
  { id: "executive-black", name: "Executive Black", category: "Corporate", outfit: "a sharp black suit with a white pocket square", location: "in an elegant executive office with dark wood furnishings", lighting: "dramatic side lighting", previewEmoji: "🖤", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/ce8c8be2-2223-4bbb-ac3f-d75d325bf724-executive-black-v1.jpg" },
  { id: "casual-blue-shirt", name: "Blue Oxford", category: "Casual", outfit: "a light blue oxford button-up shirt with rolled sleeves", location: "in a modern startup office with plants", lighting: "bright natural window light", previewEmoji: "💙", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/29806279-05a5-4e96-93df-a89765d003f4-casual-blue-shirt-v1.jpg" },
  { id: "tech-startup", name: "Tech Startup", category: "Creative", outfit: "a comfortable gray hoodie", location: "in a modern tech office with exposed brick", lighting: "bright natural window light", previewEmoji: "💻", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/6053feda-8624-43cc-92a8-8417e3be6178-tech-startup-v1.jpg" },
  { id: "finance-exec", name: "Finance Executive", category: "Industry", outfit: "a charcoal gray business suit with a light blue tie", location: "in an upscale financial office", lighting: "professional studio lighting with soft shadows", previewEmoji: "💼", previewImage: "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/2a6b32e0-4c97-4fd5-966d-375a2c5aa901-finance-exec-v1.jpg" },
];

interface StyleSelectorProps {
  totalImages: number;
  selectedStyles: SelectedStyle[];
  onStylesChange: (styles: SelectedStyle[]) => void;
}

export function StyleSelector({ totalImages, selectedStyles, onStylesChange }: StyleSelectorProps) {
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
        previewImage: preset.previewImage,
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

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Style Presets */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 px-1">Style Presets</h3>
          <div className="space-y-3 max-h-[840px] overflow-y-scroll pr-2">
            {PRESET_STYLES.map(preset => {
              const isSelected = selectedStyles.some(s => s.id === preset.id);
              return (
                <div
                  key={preset.id}
                  className={`bg-white rounded-xl border-2 p-3 flex items-center gap-4 transition-all ${
                    isSelected ? "border-blue-300 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Preview image */}
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                    {preset.previewImage ? (
                      <img
                        src={preset.previewImage}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-gray-100 to-gray-200">
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      remainingImages > 0
                        ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 shadow-md"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              );
            })}

            {/* Custom card at the bottom */}
            <div className="bg-white rounded-xl border-2 border-dashed border-blue-300 p-3 flex items-center gap-4 transition-all hover:border-blue-400 hover:bg-blue-50/50">
              {/* Custom preview - sparkles on light bg */}
              <div className="w-20 h-24 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex-shrink-0 flex items-center justify-center shadow-sm">
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-blue-500" />
                  <Sparkles className="h-4 w-4 text-blue-300 absolute -top-2 -right-1" />
                  <Sparkles className="h-3 w-3 text-blue-400 absolute -bottom-1 -left-2" />
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  remainingImages > 0
                    ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Selected Styles */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 px-1">Selected Styles</h3>
          {selectedStyles.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center h-[800px] flex flex-col items-center justify-center">
              <p className="text-gray-500">Click + to add styles</p>
              <p className="text-sm text-gray-400 mt-1">Your selections will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[840px] overflow-y-scroll pr-2">
              {selectedStyles.map(style => (
                <div
                  key={style.id}
                  className="bg-white rounded-xl border-2 border-blue-400 p-3 shadow-md relative"
                >
                  {/* Quantity badge - only for presets */}
                  {!style.isCustom && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-sm font-bold px-2.5 py-1 rounded-lg shadow-md z-10">
                      x{style.quantity}
                    </div>
                  )}

                  {/* Preview image */}
                  <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2 shadow-sm">
                    {style.isCustom ? (
                      // Custom card sparkles preview
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="relative">
                          <Sparkles className="h-12 w-12 text-blue-500" />
                          <Sparkles className="h-6 w-6 text-blue-300 absolute -top-3 -right-2" />
                          <Sparkles className="h-4 w-4 text-blue-400 absolute -bottom-2 -left-3" />
                        </div>
                      </div>
                    ) : style.previewImage ? (
                      <img
                        src={style.previewImage}
                        alt={style.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
                        ✨
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h4 className="font-semibold text-gray-900 text-sm text-center mb-2">{style.name}</h4>

                  {/* Controls - different for custom vs preset */}
                  {style.isCustom ? (
                    // Custom card: Edit and Remove buttons
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => editCustomStyle(style)}
                        className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeCustomStyle(style.id)}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    // Preset card: +/- controls
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => decrementStyle(style.id)}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => addStyle(PRESET_STYLES.find(p => p.id === style.id)!)}
                        disabled={remainingImages <= 0}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          remainingImages > 0
                            ? "border-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                            : "border-2 border-gray-200 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
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
              <Sparkles className="h-5 w-5 text-blue-500" />
              Customize Your Style
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Outfit</label>
                <select
                  value={customOutfit}
                  onChange={(e) => setCustomOutfit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="flex-1 py-2 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
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
