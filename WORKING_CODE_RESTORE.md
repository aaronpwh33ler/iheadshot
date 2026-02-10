# RESTORE WORKING CODE - "Freaking Incredible" Results

**Problem:** Another session changed the character sheet generation to use multiple images. The WORKING version used only ONE image.

---

## WHAT BROKE

The other session made these changes thinking multiple images would be better:

1. **`nano-banana.ts`** - Changed `generateCharacterSheet()` to accept array of images
2. **`generate-character-sheet/route.ts`** - Changed to process multiple `imageUrls`
3. **`InstantUpload.tsx`** - Changed to send ALL uploaded photos instead of just first one

**Why this broke things:** Sending multiple inconsistent photos confuses the AI and creates blended/averaged character sheets instead of a sharp identity lock.

---

## RESTORE INSTRUCTIONS

### File 1: `/src/lib/nano-banana.ts`

**FIND this (broken - around line 230):**
```typescript
export async function generateCharacterSheet(
  referenceImagesBase64: string | string[],
  mimeType: string = "image/jpeg"
): Promise<string> {
  const model = genAI.models;

  // Normalize to array
  const images = Array.isArray(referenceImagesBase64)
    ? referenceImagesBase64
    : [referenceImagesBase64];

  const imageCount = images.length;
  const prompt = imageCount > 1
    ? `Create a character reference sheet: front view, left profile, right profile, 3/4 view, neutral expression, plain white background, same person as in ALL of the attached reference images (use every photo to build the most accurate identity), ultra-detailed facial features, consistent identity across all angles.`
    : `Create a character reference sheet: front view, left profile, right profile, 3/4 view, neutral expression, plain white background, same person as in the attached reference image, ultra-detailed facial features, consistent identity.`;

  // Build image parts for ALL reference images
  const imageParts = images.map((imgBase64) => ({
    inlineData: {
      mimeType,
      data: imgBase64,
    },
  }));

  let response;
  try {
    response = await model.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            { text: prompt },
          ],
        },
      ],
```

**REPLACE WITH this (working):**
```typescript
export async function generateCharacterSheet(
  referenceImageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const model = genAI.models;

  const prompt = `Create a character reference sheet: front view, left profile, right profile, 3/4 view, neutral expression, plain white background, same person as in the attached reference image, ultra-detailed facial features, consistent identity.`;

  let response;
  try {
    response = await model.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: referenceImageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
```

---

### File 2: `/src/app/api/generate-character-sheet/route.ts`

**FIND this (broken):**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { orderId, imageUrl, imageUrls } = await request.json();

    // Support single imageUrl or array of imageUrls
    const urls: string[] = imageUrls || (imageUrl ? [imageUrl] : []);

    if (!orderId || urls.length === 0) {
      return NextResponse.json(
        { error: "Missing orderId or imageUrl(s)" },
        { status: 400 }
      );
    }

    // Get real order ID from stripe session
    const order = await getOrderByStripeSession(orderId);
    const realOrderId = order?.id || orderId;

    console.log(`Generating character sheet for order ${realOrderId} with ${urls.length} reference image(s)...`);

    // Convert ALL image URLs to base64
    const imageResults = await Promise.all(urls.map((url: string) => imageUrlToBase64(url)));
    const base64Images = imageResults.map((r) => r.base64);
    const mimeType = imageResults[0].mimeType;

    // Generate the character sheet using Nano Banana Pro with ALL reference images
    const characterSheetBase64 = await generateCharacterSheet(base64Images, mimeType);
```

**REPLACE WITH this (working):**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { orderId, imageUrl } = await request.json();

    if (!orderId || !imageUrl) {
      return NextResponse.json(
        { error: "Missing orderId or imageUrl" },
        { status: 400 }
      );
    }

    // Get real order ID from stripe session
    const order = await getOrderByStripeSession(orderId);
    const realOrderId = order?.id || orderId;

    console.log(`Generating character sheet for order ${realOrderId}...`);

    // Convert image URL to base64
    const { base64, mimeType } = await imageUrlToBase64(imageUrl);

    // Generate the character sheet using Nano Banana Pro
    const characterSheetBase64 = await generateCharacterSheet(base64, mimeType);
```

---

### File 3: `/src/components/InstantUpload.tsx`

**FIND this (broken - around line 295-301):**
```typescript
const sheetResponse = await fetch("/api/generate-character-sheet", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderId,
    imageUrls: uploadedUrls, // Send ALL uploaded images for best identity lock
  }),
});
```

**REPLACE WITH this (working):**
```typescript
const sheetResponse = await fetch("/api/generate-character-sheet", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderId,
    imageUrl: uploadedUrls[0], // Use first/best image only
  }),
});
```

---

## WHY SINGLE IMAGE WORKS BETTER

The "freaking incredible" results came from using **ONE clear photo** to create the character sheet because:

1. **No averaging** - Multiple photos of different quality/angles create an averaged/blended face
2. **Clear identity** - One good photo gives the AI a single, unambiguous reference
3. **Consistent character sheet** - The multi-angle sheet generated from ONE photo is internally consistent
4. **Simpler prompt** - The single-image prompt is battle-tested and works

The user uploads multiple photos for:
- Having backup options
- Gender detection
- Future use in headshot generation

But the character sheet should only use the FIRST (best) photo.

---

## GIT RESTORE COMMANDS

If you want to restore from git instead of manual edits:

```bash
# Check what the working version looked like
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai && git log --oneline -10

# Find the commit before the multi-image changes and restore
cd ~/Dropbox/Claude/Replication\ Framework/prospects/AI\ Headshot\ Generator/headshot-ai && git checkout HEAD~1 -- src/lib/nano-banana.ts src/app/api/generate-character-sheet/route.ts src/components/InstantUpload.tsx
```

---

## SUMMARY

| Component | BROKEN (current) | WORKING (restore to this) |
|-----------|------------------|---------------------------|
| `generateCharacterSheet()` | Accepts `string \| string[]` | Accepts single `string` |
| API route | Processes `imageUrls` array | Processes single `imageUrl` |
| InstantUpload | Sends `imageUrls: uploadedUrls` | Sends `imageUrl: uploadedUrls[0]` |
| Result | Blended/confused faces | Sharp identity lock |

**The key insight:** More images ≠ better results. ONE clear reference photo produces the best character sheet.
