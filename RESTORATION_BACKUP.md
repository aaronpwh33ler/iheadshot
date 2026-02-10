# iHeadshot Working Implementation Backup
**Created:** February 9, 2026
**Purpose:** Restore the working Upload/Style Selection/Results pages if needed

This document captures the EXACT working state of the iHeadshot application before any redesign work. Use this to restore the application if changes break functionality.

---

## Quick Restoration Checklist

If you need to restore the working implementation:

1. **Critical Files to Preserve/Restore:**
   - `/src/components/InstantUpload.tsx` (854 lines) - The main 3-step upload flow
   - `/src/components/StyleSelector.tsx` (276 lines) - Style selection grid
   - `/src/components/ResultsGallery.tsx` (742 lines) - Results with 4K upscale
   - `/src/app/upload/[orderId]/page.tsx` (141 lines) - Upload page wrapper
   - `/src/lib/nano-banana.ts` - AI generation logic with identity lock
   - `/src/lib/topaz.ts` - 4K upscaling logic

2. **DO NOT modify these files during redesign** unless you have a backup

---

## Application Flow Overview

### Step 1: Upload (`step === "upload"`)
- User uploads 1-5 photos via drag & drop
- Photos are compressed client-side to max 1024px
- Photos uploaded directly to Supabase Storage (bypasses Vercel limit)
- Gender detection runs on first uploaded photo
- **Demo mode**: Skips upload, shows gender selection cards

### Step 2: Style Selection (`step === "select"`)
- 2/3 + 1/3 grid layout (styles left, sidebar right)
- StyleSelector component shows 20 preset styles in 7 categories
- Sidebar shows: uploaded photos, gender toggle, selected styles, generate button
- User selects up to `headshotCount` styles (5/10/20 based on tier)

### Step 3: Generation (`step === "generate"`)
- Character sheet generated first (multi-angle reference)
- Headshots generated sequentially with identity lock
- Real-time progress shown with style names
- Results displayed in grid as they complete

### Step 4: Results Gallery
- Grid of generated images with hover actions
- Individual 4K upscale via modal with before/after slider
- Bulk 4K upscale with discount pricing
- Download individual or all (ZIP)
- Lightbox for full-screen viewing

---

## Critical Component: InstantUpload.tsx

**Location:** `/src/components/InstantUpload.tsx`
**Lines:** 854

### Key State Variables (lines 101-116):
```typescript
const [step, setStep] = useState<Step>("upload");
const [files, setFiles] = useState<FileWithPreview[]>([]);
const [selectedStyles, setSelectedStyles] = useState<SelectedStyle[]>([]);
const [generating, setGenerating] = useState(false);
const [uploading, setUploading] = useState(false);
const [generationPhase, setGenerationPhase] = useState<GenerationPhase>("idle");
const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
const [currentGenerating, setCurrentGenerating] = useState<string | null>(null);
const [currentVariant, setCurrentVariant] = useState(1);
const [error, setError] = useState<string | null>(null);
const [overLimitWarning, setOverLimitWarning] = useState(false);
const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
const [characterSheetUrl, setCharacterSheetUrl] = useState<string | null>(null);
const [characterSheetBase64, setCharacterSheetBase64] = useState<string | null>(null);
const [detectedGender, setDetectedGender] = useState<"male" | "female">("male");
const [loadingDemoImages, setLoadingDemoImages] = useState(false);
```

### Image Compression Function (lines 42-92):
- Resizes images client-side to max 1024px
- Compresses to JPEG at 80% quality
- Prevents Vercel 4.5MB upload limit issues

### Upload Flow (lines 196-265):
1. Loop through files
2. Compress each file
3. Get signed URL from `/api/upload-url`
4. Upload directly to Supabase Storage
5. Run gender detection on first image
6. Move to style selection step

### Generation Flow (lines 268-390):
1. Generate character sheet via `/api/generate-character-sheet`
2. Build generation queue from selectedStyles
3. Loop through queue, call `/api/generate-headshot-v2` for each
4. Update `generatedImages` state as each completes
5. Call `onGenerationComplete` when done

### Layout Structure:

**Step 1 - Upload (lines 470-642):**
- Drag & drop zone with photo tips
- Gender selection cards for demo mode
- Photo grid with remove buttons
- Sticky bottom bar with continue button

**Step 2 - Style Selection (lines 645-755):**
- `max-w-7xl mx-auto grid grid-cols-3 gap-8`
- Left 2/3: `StyleSelector` component
- Right 1/3: Sticky sidebar with photos, gender toggle, selected styles, generate button

**Step 3 - Generation (lines 758-839):**
- Progress indicator during generation
- Results grid as images complete
- Loading spinners for pending images

---

## Critical Component: StyleSelector.tsx

**Location:** `/src/components/StyleSelector.tsx`
**Lines:** 276

### Exports:
- `StyleConfig` interface - Style definition
- `SelectedStyle` interface - Selected style with customizations
- `OUTFIT_OPTIONS` - Dropdown options for outfits
- `LOCATION_OPTIONS` - Dropdown options for locations
- `LIGHTING_OPTIONS` - Dropdown options for lighting
- `PRESET_STYLES` - 20 preset style configurations
- `getPreviewImagePath()` - Get gender-aware preview image path
- `StyleSelector` component

### 20 Preset Styles (lines 77-105):
Categories:
- Outdoor & Natural (3): outdoor-natural, outdoor-urban, outdoor-sunset
- Corporate & Business (3): corporate-navy, corporate-gray, executive-black
- Business Casual (3): casual-blue-shirt, casual-white-shirt, smart-casual-sweater
- Creative & Modern (3): creative-turtleneck, tech-startup, creative-neon
- Studio (2): classic-studio, warm-studio
- Artistic (1): dark-dramatic
- Industry (5): finance-exec, healthcare-pro, academic-scholar, legal-pro, real-estate

### Category Configuration (lines 115-123):
```typescript
const CATEGORIES: Record<string, CategoryConfig> = {
  "Outdoor & Natural": { id: "outdoor-natural", emoji: "🌳", name: "Outdoor & Natural", isRecommended: true },
  "Corporate & Business": { id: "corporate-business", emoji: "🏢", name: "Corporate & Business" },
  "Business Casual": { id: "business-casual", emoji: "👔", name: "Business Casual" },
  "Creative & Modern": { id: "creative-modern", emoji: "🎨", name: "Creative & Modern" },
  "Studio": { id: "studio", emoji: "📸", name: "Studio" },
  "Artistic": { id: "artistic", emoji: "🌑", name: "Artistic" },
  "Industry": { id: "industry", emoji: "💼", name: "Industry" },
};
```

### Style Card Layout (lines 201-252):
- `grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3`
- Each card: image preview (3:4 aspect), style name below
- Selected state: `ring-4 ring-offset-2 ring-sky-500`
- Checkmark overlay on selected cards
- Fallback to emoji if image fails to load

### Preview Images:
- Path: `/style-previews/{gender}/{styleId}.jpg`
- Function: `getPreviewImagePath(styleId, gender)`

---

## Critical Component: ResultsGallery.tsx

**Location:** `/src/components/ResultsGallery.tsx`
**Lines:** 742

### Upscale Pricing Structure (lines 35-39):
```typescript
const PRICING = {
  basic: { all: 4.99, individual: 1.99 },      // 5 images
  standard: { all: 9.99, individual: 1.49 },   // 10 images
  premium: { all: 14.99, individual: 1.29 },   // 20 images
};
```

### Key State Variables (lines 47-56):
```typescript
const [upscaleModalImage, setUpscaleModalImage] = useState<GeneratedImage | null>(null);
const [upscaleModalOriginalUrl, setUpscaleModalOriginalUrl] = useState<string | null>(null);
const [showBulkUpscaleModal, setShowBulkUpscaleModal] = useState(false);
const [upscalingCurrent, setUpscalingCurrent] = useState(false);
const [upscalingAll, setUpscalingAll] = useState(false);
const [processingImageUrl, setProcessingImageUrl] = useState<string | null>(null);
const [sliderPosition, setSliderPosition] = useState(50);
const sliderRef = useRef<HTMLDivElement>(null);
const isDragging = useRef(false);
```

### Before/After Slider (lines 389-509):
- `upscaleModalOriginalUrl` stores original image for "before"
- Slider position controls clip path: `clipPath: inset(0 0 0 ${sliderPosition}%)`
- "Before" shows original URL, "After" shows upscaled URL
- Processing overlay with scanning line effect

### Download Functions:
- `downloadAll()` - Creates ZIP with all images
- `downloadSingle()` - Downloads individual image
- Extension detection: `.png` → png, `.webp` → webp, else → jpg

### Upscale Functions:
- `upscaleSingle()` - Upscales one image via `/api/upscale`
- `upscaleAll()` - Upscales all images at once

### Modal Structure (lines 366-559):
```typescript
<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4">
  <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
    {/* Header */}
    {/* Before/After Slider */}
    {/* Footer with pricing/buttons */}
  </div>
</div>
```

---

## API Routes Overview

| Route | Purpose |
|-------|---------|
| `/api/upload-url` | Get signed URL for direct Supabase upload |
| `/api/detect-gender` | Detect gender from photo for style previews |
| `/api/generate-character-sheet` | Create multi-angle character reference |
| `/api/generate-headshot-v2` | Generate single headshot with identity lock |
| `/api/upscale` | Topaz Labs 4K upscaling |
| `/api/status/[orderId]` | Get order status and existing images |
| `/api/checkout` | Create Stripe checkout session |
| `/api/webhook/stripe` | Handle Stripe webhook events |

---

## Topaz Upscaling Configuration

**File:** `/src/lib/topaz.ts`

### Current Settings:
```typescript
formData.append("model", "High Fidelity V2"); // Faithful upscaling
formData.append("output_width", "2560"); // 2x from ~1280 input
formData.append("output_format", "jpeg");
```

### Strategy:
1. Generate at ~1024px (Gemini limit)
2. 2x AI upscale to ~2560px (uses 1 Topaz credit)
3. Resize to 4K portrait (2880×3840) using Sharp

---

## Identity Lock Prompt

**File:** `/src/lib/nano-banana.ts` (lines 293-303)

```typescript
const identityLockPrompt = `STRICT IDENTITY LOCK USING REFERENCE IMAGES:

Use ALL attached reference images as the absolute ground truth for this character's identity.
- Main reference: exact face, skin tone/texture/details, eye shape/color, nose, mouth, jawline, hairline, freckles/marks, age appearance.
- Character sheet: full multi-angle confirmation of proportions, head shape from side/profile/3/4 views, expressions range, no alterations allowed.

Preserve 100% identical facial features, bone structure, exact face shape, exact eye placement & color, nose shape, lip shape, skin texture/details, hair texture/density/parting, age/youth appearance — NO changes, NO morphing, NO aging, NO plastic look, NO blending with other faces.

Only modify: Professional headshot, for business profiles, profile pictures, and respectable contact images. To be used solely in the business sphere. Wearing ${outfit}, standing ${style.location} at ${style.lighting}, ${style.pose}, ${style.expression}.

Ultra-photorealistic, high-fidelity identity preservation, sharp facial details, consistent lighting on face matching references where possible.`;
```

---

## Landing Page (page.tsx)

**Location:** `/src/app/page.tsx`
**Lines:** 473

### Sections:
1. Navigation (fixed, backdrop blur)
2. Hero (2-column grid, sample headshots, CTA)
3. How It Works (3-step cards)
4. Our Styles (10 style previews grid)
5. Pricing (3 tiers: $9.99, $14.99, $24.99)
6. Comparison Table (iHeadshot vs Photo Studio)
7. FAQ (5 expandable questions)
8. Final CTA
9. Footer

### Color Scheme:
- Primary: `brand-600` (#0ea5e9 sky blue)
- Gradients: `hero-gradient`, `orange-section`, `dark-orange-section`
- Cards: White with `border-brand-100`, `rounded-3xl`

---

## Upload Page Wrapper

**Location:** `/src/app/upload/[orderId]/page.tsx`
**Lines:** 141

### Logic:
1. Fetch order from `/api/status/${orderId}`
2. If images exist, show `ResultsGallery`
3. Otherwise, show `InstantUpload` component
4. Demo mode ID: `cs_test_a10w4eDn4CKk4FR9IgZh6bhHoaQpgMVuXjLs35oUdR6xC6wnA96VUPLTUP`

---

## CSS Classes Used

### Tailwind Configuration:
- `brand-600`: #0ea5e9 (primary sky blue)
- `brand-50`, `brand-100`, etc.: Color scale
- `warm-50`: Background accent

### Custom Classes (in globals.css):
- `.hero-gradient`: Landing page hero background
- `.orange-section`: Light orange section background
- `.dark-orange-section`: Dark CTA section
- `.card-hover`: Hover transform effect
- `.blob`: Animated background blobs
- `.gradient-text`: Gradient text effect

---

## File Checksums (for verification)

Run these commands to verify files haven't been modified:

```bash
# Get line counts to quickly check file integrity
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai
wc -l src/components/InstantUpload.tsx      # Should be ~854
wc -l src/components/StyleSelector.tsx      # Should be ~276
wc -l src/components/ResultsGallery.tsx     # Should be ~742
wc -l src/app/upload/\[orderId\]/page.tsx   # Should be ~141
wc -l src/app/page.tsx                      # Should be ~473
```

---

## Restoration Commands

If you need to restore from git:

```bash
# Check what changed
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai && git diff src/components/InstantUpload.tsx

# Restore specific file from last commit
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai && git checkout HEAD -- src/components/InstantUpload.tsx

# Restore multiple files
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai && git checkout HEAD -- src/components/InstantUpload.tsx src/components/StyleSelector.tsx src/components/ResultsGallery.tsx
```

---

## Summary

This document captures the complete working state of the iHeadshot Upload → Style Selection → Generation → Results flow as of February 9, 2026. The key files are:

1. **InstantUpload.tsx** (854 lines) - The entire 3-step wizard
2. **StyleSelector.tsx** (276 lines) - 20 preset styles, category grid
3. **ResultsGallery.tsx** (742 lines) - Results display with 4K upscale modal
4. **nano-banana.ts** - Gemini/Imagen 3 generation with identity lock
5. **topaz.ts** - 4K upscaling via Topaz Labs API

All of these files work together to create the complete user experience. Do not modify them during redesign work without creating backups first.
