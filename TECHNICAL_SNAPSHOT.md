# Technical Snapshot - February 6, 2026

This document contains exact code snippets and configurations for session continuity.

---

## 1. Topaz Upscaling Configuration

**File:** `/src/lib/topaz.ts`

### Current API Call (lines 152-156):
```typescript
const formData = new FormData();
formData.append("image", imageBlob, "image.jpg");
formData.append("model", "High Fidelity V2"); // Faithful upscaling - preserves original without AI artifacts
formData.append("output_width", outputWidth.toString());
formData.append("output_format", outputFormat);
```

### Target Dimensions (lines 10-12):
```typescript
const TARGET_4K_WIDTH = 2880; // 4K portrait width
const TARGET_4K_HEIGHT = 3840; // 4K portrait height
```

### 2x Strategy (lines 148-150):
```typescript
// Step 2: Call Topaz API for 2x upscale (faster, better quality, uses 1 credit)
// 2x from ~720p gives us ~1440p, which we then resize to 4K
const outputWidth = 2560; // 2x from typical 1280 input
```

---

## 2. Upscaling Pricing Structure

**File:** `/src/components/ResultsGallery.tsx` (lines 35-39)

```typescript
const PRICING = {
  basic: { all: 4.99, individual: 1.99 },      // 5 images: $4.99 all vs $9.95 individual
  standard: { all: 9.99, individual: 1.49 },   // 10 images: $9.99 all vs $14.90 individual
  premium: { all: 14.99, individual: 1.29 },   // 20 images: $14.99 all vs $25.80 individual
};
```

---

## 3. ResultsGallery State Management

**File:** `/src/components/ResultsGallery.tsx` (lines 47-56)

```typescript
// Upscale modal state
const [upscaleModalImage, setUpscaleModalImage] = useState<GeneratedImage | null>(null);
const [upscaleModalOriginalUrl, setUpscaleModalOriginalUrl] = useState<string | null>(null); // Store original for before/after
const [showBulkUpscaleModal, setShowBulkUpscaleModal] = useState(false);
const [upscalingCurrent, setUpscalingCurrent] = useState(false);
const [upscalingAll, setUpscalingAll] = useState(false);
const [processingImageUrl, setProcessingImageUrl] = useState<string | null>(null); // For processing overlay
const [sliderPosition, setSliderPosition] = useState(50);
const sliderRef = useRef<HTMLDivElement>(null);
const isDragging = useRef(false);
```

### Modal Open/Close (lines 209-219):
```typescript
const openUpscaleModal = (image: GeneratedImage) => {
  setUpscaleModalImage(image);
  setUpscaleModalOriginalUrl(image.imageUrl); // Store original URL for before/after comparison
  setSliderPosition(50);
};

const closeUpscaleModal = () => {
  setUpscaleModalImage(null);
  setUpscaleModalOriginalUrl(null);
  setUpscalingCurrent(false);
};
```

---

## 4. Download Format Detection

**File:** `/src/components/ResultsGallery.tsx` (lines 96-97, 114-115)

```typescript
// Determine extension - default to jpg for best compatibility
const extension = image.imageUrl.includes(".png") ? "png" : image.imageUrl.includes(".webp") ? "webp" : "jpg";
```

---

## 5. Responsive Modal Classes

**File:** `/src/components/ResultsGallery.tsx`

### Outer container (lines 362-368):
```typescript
<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4">
  <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
```

### Image area (lines 385-389):
```typescript
<div
  ref={sliderRef}
  className="relative aspect-[3/4] sm:aspect-[4/5] bg-gray-900 overflow-hidden cursor-ew-resize select-none flex-1 min-h-0"
  style={{ maxHeight: 'calc(95vh - 180px)' }}
>
```

### Footer (lines 521-522):
```typescript
<div className="p-3 sm:p-4 bg-gray-50 border-t shrink-0">
```

---

## 6. Identity Lock Prompt

**File:** `/src/lib/nano-banana.ts` (lines 228-238)

```typescript
const identityLockPrompt = `STRICT IDENTITY LOCK USING REFERENCE IMAGES:

Use ALL attached reference images as the absolute ground truth for this character's identity.
- Main reference: exact face, skin tone/texture/details, eye shape/color, nose, mouth, jawline, hairline, freckles/marks, age appearance.
- Character sheet: full multi-angle confirmation of proportions, head shape from side/profile/3/4 views, expressions range, no alterations allowed.

Preserve 100% identical facial features, bone structure, exact face shape, exact eye placement & color, nose shape, lip shape, skin texture/details, hair texture/density/parting, age/youth appearance — NO changes, NO morphing, NO aging, NO plastic look, NO blending with other faces.

Only modify: Professional headshot, for business profiles, profile pictures, and respectable contact images. To be used solely in the business sphere. Wearing ${style.outfit}, standing ${style.location} at ${style.lighting}, ${style.pose}, ${style.expression}.

Ultra-photorealistic, high-fidelity identity preservation, sharp facial details, consistent lighting on face matching references where possible.`;
```

---

## 7. Topaz API Valid Models

From error messages, these are the supported API models:
```
'Bloom', 'Bloom Realism', 'Bloom Precision', 'Wonder 2', 'Reimagine',
'Redefine', 'Colorize', 'img-enhance-wonder', 'Dust-Scratch V2', 'Object',
'Transparency Upscale', 'Adjust V2', 'Portrait', 'Wildlife', 'Auto Sharpen',
'Denoise Normal', 'Denoise Strong', 'Sharpen Standard', 'Sharpen Strong',
'Upscale Standard', 'Upscale CGI', 'Upscale High Fidelity',
'Face Recovery Natural', 'Upscale Autopilot', 'Face Quality Analysis Autopilot',
'Subject Classifier Autopilot', 'Age of Photo Classifier Autopilot',
'Noise Blur Autopilot', 'Salient Masking Autopilot', 'Text Masking Autopilot',
'SAM3 Masking Autopilot', 'Detail', 'Natural Enhance'
```

**IMPORTANT:** The actual working model names from documentation are different:
- `Standard V2` (not "Upscale Standard")
- `High Fidelity V2` (not "Upscale High Fidelity")
- `Low Resolution V2`
- etc.

---

## 8. Supabase Storage Paths

```typescript
// User uploads
`uploads/${orderId}/${filename}`

// Generated headshots
`generated/${orderId}/${uuid}-${styleId}-v${variant}.jpg`

// Upscaled versions
`generated/${orderId}/upscaled-4k-${timestamp}.jpg`
```

---

## 9. Processing Overlay (No Particles)

**File:** `/src/components/ResultsGallery.tsx` (lines 451-490)

The processing overlay now only includes:
- Blurred image with green tint
- Scanning line effect (bouncing horizontal line)
- Center content with Zap icon and loading spinner

Particles were removed because they were static and looked bad.

---

## 10. Before/After Slider Logic

The "before" image always uses `upscaleModalOriginalUrl`:
```typescript
src={upscaleModalOriginalUrl || upscaleModalImage.imageUrl}
```

The "after" image uses the current (potentially upscaled) URL:
```typescript
src={upscaleModalImage.imageUrl}
```

This ensures the comparison works correctly even after the image URL is updated post-upscale.

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| Topaz config | `/src/lib/topaz.ts` |
| Gemini/Imagen config | `/src/lib/nano-banana.ts` |
| Results UI | `/src/components/ResultsGallery.tsx` |
| Style selector | `/src/components/StyleSelector.tsx` |
| Main generation API | `/src/app/api/generate-headshot-v2/route.ts` |
| Upscale API | `/src/app/api/upscale/route.ts` |
| Environment vars | `.env.local` (local) / Vercel dashboard (prod) |
