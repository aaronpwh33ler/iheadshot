# iHeadshot — Change Requests & Status Tracker

Last updated: February 16, 2026

---

## COMPLETED (This Session)

### 1. Remove How It Works / Pricing / FAQ from post-checkout pages
- **Status:** DONE
- **File:** `src/components/LayoutShell.tsx`
- **Change:** Header and Footer (which contain How It Works, Pricing, FAQ nav links) are now hidden on `/upload/*`, `/gallery/*`, and `/processing/*` routes. They still appear on the landing page and other marketing pages like `/pricing`.

### 2. Change "Premium Quality" badge to tier name
- **Status:** DONE
- **File:** `src/components/ResultsGallery.tsx`
- **Change:** The orange chip on each generated image now shows the tier name (Basic, Standard, or Premium) instead of "Premium quality". The lightbox view also shows just the tier name. Badge displays for all tiers, not just premium.

### 3. Remove Custom Style option (temporary)
- **Status:** DONE
- **File:** `src/components/StyleSelector.tsx`
- **Change:** The "Custom — Create your own" card at the bottom of the Style Presets list is commented out. The custom style editing modal and logic are preserved in code for when it's re-enabled. The custom style handling in `nano-banana.ts` and `generate-headshot-v2/route.ts` still works if a custom style somehow gets through.

### 4. Update logo to v2
- **Status:** DONE
- **Files:** `src/app/page.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- **Change:** All references to `logo-white-on-orange.png` replaced with `iHeadshot_Logo_v2.png`. The v2 logo file was already in `public/logo/`. Favicons and apple-touch-icon remain unchanged (separate assets in `layout.tsx`).

---

## PENDING (Future Sessions)

### 5. Redo Feature — Per-Image Regeneration
- **Status:** NOT STARTED
- **Description:** Allow users to redo specific images they're unhappy with. Each redo regenerates a single style with a new generation attempt.
- **Pricing model:**
  - Premium (20 images, $25 tier): 3 free redos, additional redos at ~$1.25/image ($25 / 20)
  - Standard (10 images, $15 tier): 2 free redos, additional redos at ~$1.50/image
  - Basic (5 images, $5 tier): 1 free redo, additional redos at ~$1.00/image
- **UX concept:** After images are generated, each image card gets a "Redo" button. User can select which images to redo (up to their free redo count). After free redos are used, additional redos prompt a payment modal at the per-image rate.
- **Implementation considerations:**
  - Need to track redo count per order in Supabase (e.g., `redos_used` column on orders table)
  - Need a new API endpoint or modify existing `generate-headshot-v2` to handle single-style regeneration
  - Need Stripe integration for paid redos (could use Checkout Session or PaymentIntent)
  - The generation uses all uploaded reference images, so redos should use the same set

### 6. Upscale Pricing Change — $0.99 per image
- **Status:** NOT STARTED
- **Description:** Current upscale pricing feels too steep. Change to $0.99 per image across all tiers.
- **Files to update:** `src/components/ResultsGallery.tsx` (PRICING constant), possibly Stripe product/price IDs
- **Current pricing:**
  - Basic: $1.99/image, $4.99 all
  - Standard: $1.49/image, $9.99 all
  - Premium: $1.29/image, $14.99 all
- **New pricing:** $0.99/image for all tiers. Bulk pricing TBD.

### 7. User Account Creation (Email + Password)
- **Status:** NOT STARTED
- **Description:** Users need accounts to store their images and past sessions. This enables future features like an image editor where users can go back and edit old headshots.
- **Auth method:** Email + password (traditional signup with email verification)
- **Implementation considerations:**
  - Supabase Auth with email/password provider
  - New pages: `/login`, `/signup`, `/account`, `/forgot-password`
  - User dashboard showing past orders/sessions with generated images
  - Link orders to user accounts (update orders table with `user_id`)
  - Guest checkout should still work (optional account creation after purchase)
  - Session/image storage: images already in Supabase Storage, just need to associate with user
  - Protected routes middleware for account pages

### 8. Re-enable Custom Style (with improvements)
- **Status:** ON HOLD — waiting for design decisions
- **Description:** The Custom style option has been temporarily removed. Needs rethinking of the UX for how users configure custom styles (outfit, location, lighting dropdowns).
- **Code location:** `src/components/StyleSelector.tsx` — the custom card is commented out but all logic is preserved.

---

## NOTES

### Prompt Discrepancy: StyleSelector vs nano-banana.ts
The `PRESET_STYLES` array in `StyleSelector.tsx` contains the OLD verbose outfit/location/lighting descriptions used for display purposes, while `nano-banana.ts` has the revised trimmed `promptSentence` values used for actual generation. For example:
- **Warm Studio in StyleSelector:** "a soft earth-tone cashmere sweater with a collared shirt underneath"
- **Warm Studio in nano-banana.ts:** "Wearing a brown suit jacket, warm cream backdrop, warm studio lighting, standing relaxed natural pose, friendly and relaxed"

The `StyleSelector` descriptions don't affect generation — they're purely cosmetic for the style picker UI. But they should eventually be synced for consistency.

### Current Tier Pricing (Stripe test mode)
- Basic: $5 — 5 headshots
- Standard: $15 — 10 headshots
- Premium: $25 — 20 headshots
