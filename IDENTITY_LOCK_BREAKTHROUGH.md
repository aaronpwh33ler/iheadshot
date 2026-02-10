# The Identity Lock Breakthrough

**Why the AI headshots look "freaking incredible"**

---

## The Problem We Solved

Most AI headshot generators have a fatal flaw: **the generated person doesn't look like the original person**. The AI morphs faces, changes bone structure, ages people up/down, or blends features with generic "attractive" templates.

This makes the headshots useless for professional use because they're not actually *you*.

---

## The Solution: Two-Phase Identity Lock

We implemented a **two-phase generation system** that forces the AI to preserve 100% of the person's identity:

### Phase 1: Character Sheet Generation

Before generating any headshots, we first create a **multi-angle character reference sheet** from the user's uploaded photo:

```
Create a character reference sheet: front view, left profile, right profile,
3/4 view, neutral expression, plain white background, same person as in the
attached reference image, ultra-detailed facial features, consistent identity.
```

This captures:
- Front-facing view
- Left profile
- Right profile
- 3/4 angle view
- Neutral expression baseline

**Why this works:** The AI now has multiple angles of the person's face to reference, making it much harder to "drift" away from their actual features.

### Phase 2: Identity-Locked Headshot Generation

For each headshot, we feed the AI **TWO images** plus a strict identity preservation prompt:

1. **Original reference image** (user's uploaded photo)
2. **Character sheet** (multi-angle reference from Phase 1)

Plus this **Identity Lock Prompt**:

```
STRICT IDENTITY LOCK USING REFERENCE IMAGES:

Use ALL attached reference images as the absolute ground truth for this
character's identity.

- Main reference: exact face, skin tone/texture/details, eye shape/color,
  nose, mouth, jawline, hairline, freckles/marks, age appearance.
- Character sheet: full multi-angle confirmation of proportions, head shape
  from side/profile/3/4 views, expressions range, no alterations allowed.

Preserve 100% identical facial features, bone structure, exact face shape,
exact eye placement & color, nose shape, lip shape, skin texture/details,
hair texture/density/parting, age/youth appearance — NO changes, NO morphing,
NO aging, NO plastic look, NO blending with other faces.

Only modify: Professional headshot, for business profiles, profile pictures,
and respectable contact images. To be used solely in the business sphere.
Wearing [outfit], standing [location] at [lighting], [pose], [expression].

Ultra-photorealistic, high-fidelity identity preservation, sharp facial
details, consistent lighting on face matching references where possible.
```

---

## Key Files

| File | Purpose |
|------|---------|
| `/src/lib/nano-banana.ts` | Core identity lock logic |
| `/src/app/api/generate-character-sheet/route.ts` | Phase 1 API endpoint |
| `/src/app/api/generate-headshot-v2/route.ts` | Phase 2 API endpoint |

---

## The Critical Prompt Elements

### What We Tell the AI to PRESERVE:
- Exact face shape
- Bone structure
- Eye placement, shape, and color
- Nose shape
- Lip shape
- Skin tone, texture, and details (freckles, marks)
- Hair texture, density, and parting
- Age appearance

### What We Tell the AI NOT to Do:
- NO changes
- NO morphing
- NO aging
- NO "plastic" look
- NO blending with other faces

### What We ALLOW the AI to Modify:
- Outfit/clothing
- Background/location
- Lighting
- Pose
- Expression (within natural range)

---

## Why This Combination Works

1. **Multi-angle reference** - The character sheet gives the AI a 360° understanding of the person's face, not just one angle

2. **Redundant references** - By providing BOTH the original photo AND the character sheet, we create redundancy that prevents drift

3. **Explicit constraints** - The detailed "preserve this, don't do that" list leaves no ambiguity about what should stay constant

4. **Professional framing** - By explicitly stating it's for "business profiles" and "professional use", we guide the AI toward appropriate, realistic outputs

---

## Technical Implementation

### API Model Used
```javascript
model: "gemini-2.0-flash-exp-image-generation"
```

### Sending Both Reference Images
```javascript
response = await model.generateContent({
  model: "gemini-2.0-flash-exp-image-generation",
  contents: [
    {
      role: "user",
      parts: [
        // Main reference image first
        {
          inlineData: {
            mimeType,
            data: referenceImageBase64,
          },
        },
        // Character sheet second
        {
          inlineData: {
            mimeType,
            data: characterSheetBase64,
          },
        },
        { text: identityLockPrompt },
      ],
    },
  ],
  config: {
    responseModalities: ["image", "text"],
  },
});
```

---

## Results

This system produces headshots where:
- The person is **immediately recognizable** as themselves
- Face shape, features, and proportions are **preserved exactly**
- Only the outfit, background, lighting, and pose change
- Results look like **actual professional photography**, not AI art

---

## Summary

The breakthrough was moving from:

❌ **Single prompt approach:** "Generate a headshot of this person wearing X in Y location"

To:

✅ **Two-phase identity lock:**
1. First, create a multi-angle character sheet to lock in identity
2. Then, generate headshots using BOTH references with explicit identity preservation constraints

This is what makes the headshots "freaking incredible" - they actually look like the person.
