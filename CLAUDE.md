# Claude Context for iHeadshot Project

## User Preferences

**IMPORTANT:** Aaron prefers full terminal commands that can be copy/pasted directly. Never ask him to `cd` into a folder first - always provide the complete command with the full path. Example:

```bash
# GOOD - Full command ready to paste:
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai && git add -A && git commit -m "message" && git push

# BAD - Requires manual cd first:
git add -A && git commit -m "message" && git push
```

---

## Quick Start

This is an AI headshot generator using:
- **Next.js 14+** with App Router
- **Google Gemini API** (Imagen 3) for image generation
- **Topaz Labs API** for 4K upscaling
- **Supabase** for database + storage
- **Stripe** for payments
- **Vercel** for deployment (auto-deploys on push to main)

**Live site:** https://www.iheadshot.co
**Local project path:** `~/Dropbox/Claude/Replication Framework/prospects/AI Headshot Generator/headshot-ai`

## Essential Files to Read First

1. `PROJECT_STATE.md` - Full project overview and current state
2. `TECHNICAL_SNAPSHOT.md` - Exact code snippets and configurations
3. `/src/lib/nano-banana.ts` - Image generation logic and style definitions
4. `/src/lib/topaz.ts` - Upscaling configuration
5. `/src/components/ResultsGallery.tsx` - Main UI with upscale modal
6. `/design-mockups/` - HTML mockups for redesign (landing, upload, styles, results pages)

## Current Configuration

### Topaz Upscaling
- Model: `High Fidelity V2` (preserves original, minimal AI artifacts)
- Strategy: 2x AI upscale → resize to 4K with Sharp
- Output: 2880×3840 JPEG

### Known Quality Considerations
The Topaz upscaling produces slightly different results than original Nano Banana output. Original has more natural skin texture. This is a known tradeoff - "High Fidelity V2" is the most faithful option available.

## Common Commands (Ready to Copy/Paste)

```bash
# Push changes to deploy
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai && git add -A && git commit -m "Your message" && git push

# Check TypeScript compilation
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai && npx tsc --noEmit

# Run dev server locally
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai && npm run dev

# Open design mockups
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai/design-mockups && open landing-page.html
```

## Recent Work (Feb 6, 2026)

- Implemented 4K upscaling with Topaz Labs API
- Fixed before/after slider (stores original URL separately)
- Made upscale modal responsive (max-h-[95vh], stacked layout on mobile)
- Changed download format detection (defaults to JPG)
- Removed static particles from processing animation
- Tested multiple Topaz models, settled on "High Fidelity V2"
- **Created design mockups** in `/design-mockups/`:
  - `landing-page.html` - Full marketing homepage
  - `upload-page.html` - Photo upload flow
  - `styles-page.html` - Style selection with package picker
  - `results-page.html` - Results gallery with 4K upgrade

## Design Direction (from Feb 6 session)
- Modern, clean, approachable
- Sleek light mode interface
- Pops of color (sky blue, mint, coral, purple)
- Trustworthy and professional feel
- Uses Inter font family

## Environment Variables

Required in `.env.local` and Vercel:
- `GOOGLE_AI_API_KEY`
- `TOPAZ_API_KEY` (value: `74cb8418-ea52-4afc-9b2b-8a1e6bea7343`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
