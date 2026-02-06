# Claude Context for iHeadshot Project

## Quick Start

This is an AI headshot generator using:
- **Next.js 14+** with App Router
- **Google Gemini API** (Imagen 3) for image generation
- **Topaz Labs API** for 4K upscaling
- **Supabase** for database + storage
- **Stripe** for payments
- **Vercel** for deployment

**Live site:** https://www.iheadshot.co

## Essential Files to Read First

1. `PROJECT_STATE.md` - Full project overview and current state
2. `TECHNICAL_SNAPSHOT.md` - Exact code snippets and configurations
3. `/src/lib/nano-banana.ts` - Image generation logic and style definitions
4. `/src/lib/topaz.ts` - Upscaling configuration
5. `/src/components/ResultsGallery.tsx` - Main UI with upscale modal

## Current Configuration

### Topaz Upscaling
- Model: `High Fidelity V2` (preserves original, minimal AI artifacts)
- Strategy: 2x AI upscale → resize to 4K with Sharp
- Output: 2880×3840 JPEG

### Known Quality Considerations
The Topaz upscaling produces slightly different results than original Nano Banana output. Original has more natural skin texture. This is a known tradeoff - "High Fidelity V2" is the most faithful option available.

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
git push         # Deploy to Vercel (auto)
```

## Recent Work (Feb 6, 2026)

- Implemented 4K upscaling with Topaz Labs API
- Fixed before/after slider (stores original URL separately)
- Made upscale modal responsive
- Changed download format detection (defaults to JPG)
- Removed static particles from processing animation
- Tested multiple Topaz models, settled on "High Fidelity V2"

## Environment Variables

Required in `.env.local` and Vercel:
- `GOOGLE_AI_API_KEY`
- `TOPAZ_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
