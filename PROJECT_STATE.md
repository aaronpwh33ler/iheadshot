# iHeadshot Project State Document
**Last Updated:** February 6, 2026
**Domain:** https://www.iheadshot.co

---

## Project Overview

iHeadshot is an AI-powered professional headshot generator that creates high-quality business portraits from user-uploaded selfies. The service uses Google's Imagen 3 (via Gemini API, internally called "Nano Banana") for image generation.

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (bucket: `headshots`)
- **Payments:** Stripe
- **AI Image Generation:** Google Gemini API (`gemini-2.0-flash-exp-image-generation`)
- **Image Upscaling:** Topaz Labs Image API
- **Deployment:** Vercel

---

## Core Features

### 1. Image Generation Flow
1. User uploads selfie(s)
2. System generates a "character sheet" (multi-angle reference) using Imagen 3
3. System generates headshots in selected styles using identity lock prompting
4. Results displayed in gallery with download options

### 2. Style System
15 predefined styles across categories:
- Corporate & Business (Navy, Gray, Executive Black)
- Business Casual (Blue Shirt, White Shirt, Sweater)
- Creative & Modern (Turtleneck, Tech Startup)
- Outdoor & Natural (Natural Light, Urban, Golden Hour)
- Industry Specific (Healthcare, Academic, Finance, Legal)

Styles defined in: `/src/lib/nano-banana.ts` (HEADSHOT_STYLES array)

### 3. Pricing Tiers
```typescript
// Defined in multiple places - keep in sync
Basic: $9.99 for 5 headshots
Standard: $14.99 for 10 headshots
Premium: $24.99 for 20 headshots
```

### 4. 4K Upscaling Feature
- Uses Topaz Labs Image API
- Current model: `High Fidelity V2` (chosen for faithful preservation)
- Strategy: 2x AI upscale → resize to 4K (2880×3840) using Sharp
- Pricing structure in ResultsGallery:
```typescript
const PRICING = {
  basic: { all: 4.99, individual: 1.99 },
  standard: { all: 9.99, individual: 1.49 },
  premium: { all: 14.99, individual: 1.29 },
};
```

---

## Key Files & Their Purpose

### API Routes (`/src/app/api/`)
| Route | Purpose |
|-------|---------|
| `/generate-headshot-v2` | Main generation endpoint using identity lock |
| `/generate-character-sheet` | Creates multi-angle character reference |
| `/upscale` | Topaz 4K upscaling endpoint |
| `/checkout` | Stripe checkout session creation |
| `/webhook/stripe` | Stripe webhook handler |
| `/status/[orderId]` | Check generation status |

### Core Libraries (`/src/lib/`)
| File | Purpose |
|------|---------|
| `nano-banana.ts` | Imagen 3/Gemini integration, style definitions |
| `topaz.ts` | Topaz Labs upscaling integration |
| `supabase.ts` | Supabase client and helpers |
| `stripe.ts` | Stripe configuration |

### Components (`/src/components/`)
| Component | Purpose |
|-----------|---------|
| `ResultsGallery.tsx` | Main results display with upscale modal, before/after slider |
| `StyleSelector.tsx` | Style selection interface (1/3 presets, 2/3 selected layout) |
| `UploadZone.tsx` | File upload handling |

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Google AI (Imagen 3 / Gemini)
GOOGLE_AI_API_KEY=

# Topaz Labs
TOPAZ_API_KEY=74cb8418-ea52-4afc-9b2b-8a1e6bea7343
```

---

## Recent Implementation Details

### Topaz Upscaling Configuration
**File:** `/src/lib/topaz.ts`

Current settings:
```typescript
formData.append("model", "High Fidelity V2"); // Faithful upscaling
formData.append("output_width", "2560"); // 2x from ~1280 input
formData.append("output_format", "jpeg");
```

**Model Options Tested:**
- `Bloom Realism` - Generative, adds AI detail (caused splotchy skin)
- `Standard V2` - General purpose
- `High Fidelity V2` - Current choice, preserves original best

**Note:** The Topaz API model names differ from the desktop app:
- Desktop "Realism" ≠ API "Realism" (doesn't exist in API)
- API uses: "Standard V2", "High Fidelity V2", "Low Resolution V2", etc.

### Before/After Slider Implementation
**File:** `/src/components/ResultsGallery.tsx`

Key state variables:
```typescript
const [upscaleModalOriginalUrl, setUpscaleModalOriginalUrl] = useState<string | null>(null);
```

The original URL is stored separately so "before" always shows the original image even after upscaling updates the main URL.

### Download Format
Downloads now correctly detect file type and default to JPG:
```typescript
const extension = image.imageUrl.includes(".png") ? "png" :
                  image.imageUrl.includes(".webp") ? "webp" : "jpg";
```

---

## Known Issues & Considerations

### 1. Upscale Quality
The Topaz upscaling, even with "High Fidelity V2", produces slightly different results than the original Nano Banana output. The original has more natural skin texture. Consider:
- Offering upscaling as optional premium feature only
- Exploring Google's own Imagen upscale API (Vertex AI)
- Delivering 1K originals as the base (what most competitors do)

### 2. Image Resolution Limits
- Gemini API generates at ~1024×1024 max
- Cannot request higher resolution directly from Imagen 3
- Upscaling is the only way to get 4K

### 3. Responsive Modal
The upscale modal is now responsive with:
- `max-h-[95vh]` viewport constraint
- Responsive padding and text sizes
- Stacked layout on mobile
- `maxHeight: 'calc(95vh - 180px)'` on the image area

---

## Database Schema (Supabase)

### Tables
- `orders` - Order records with stripe session IDs
- `generated_images` - Generated headshot records
  - `order_id`, `image_url`, `style`, `style_name`, `quality`, `created_at`

### Storage Buckets
- `headshots` - All uploaded and generated images
  - `/uploads/{orderId}/` - User uploads
  - `/generated/{orderId}/` - Generated headshots
  - `/generated/{orderId}/upscaled-4k-*` - Upscaled versions

---

## Git Repository State

**Branch:** main
**Last commits include:**
- Topaz model changes (Standard V2 → High Fidelity V2)
- Responsive modal improvements
- Download format detection fix
- Before/after slider fix
- Particle removal from processing animation

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Deploy (auto via Vercel on push to main)
git push
```

---

## URL Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/upload/[orderId]` | Upload & generation flow |
| `/results/[orderId]` | Results gallery (may redirect to upload page) |

---

## Third-Party API Documentation

- **Topaz Labs API:** https://developer.topazlabs.com/image-api/
- **Google Gemini API:** https://ai.google.dev/
- **Stripe:** https://stripe.com/docs
- **Supabase:** https://supabase.com/docs

---

## Contact & Resources

- **Topaz API Key Location:** `/Users/aaron/Dropbox/Claude/Replication Framework/prospects/AI Headshot Generator/keys/topaz api key.txt`
- **Project Folder:** `/Users/aaron/Dropbox/Claude/Replication Framework/prospects/AI Headshot Generator/headshot-ai`

---

## Session Continuation Checklist

When starting a new session:
1. Read this document first
2. Check `/src/lib/topaz.ts` for current upscaling configuration
3. Check `/src/components/ResultsGallery.tsx` for UI state
4. Verify environment variables are set in Vercel dashboard
5. Test on https://www.iheadshot.co after any changes
