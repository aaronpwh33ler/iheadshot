import { NextRequest, NextResponse } from "next/server";

// Demo order ID for testing - skip generation and return existing images
const DEMO_ORDER_ID = "cs_test_a10w4eDn4CKk4FR9IgZh6bhHoaQpgMVuXjLs35oUdR6xC6wnA96VUPLTUP";

// Hardcoded demo images from Supabase storage
// These are the 20 images generated during testing stored in:
// headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3/
const SUPABASE_STORAGE_BASE = "https://dkboikgtiflcrksjmouo.supabase.co/storage/v1/object/public/headshots/generated/a7387025-e98a-462e-97d8-185f323acaf3";

const DEMO_IMAGES = [
  { filename: "5c3330ae-7f62-49e3-99bf-153edfb3572d-outdoor-natural-v1.jpg", style: "outdoor-natural", styleName: "Natural Light", variant: 1 },
  { filename: "cfadb407-108b-425b-88e9-f20f91cf2792-outdoor-natural-v2.jpg", style: "outdoor-natural", styleName: "Natural Light", variant: 2 },
  { filename: "7b4aa176-f65d-4790-ae21-3546cc20bb70-outdoor-sunset-v1.jpg", style: "outdoor-sunset", styleName: "Golden Hour", variant: 1 },
  { filename: "5c69208a-c1a6-4b2e-96d1-827319920029-outdoor-sunset-v2.jpg", style: "outdoor-sunset", styleName: "Golden Hour", variant: 2 },
  { filename: "902349f2-4bc9-4037-b9a7-8e6e1ccba629-outdoor-urban-v1.jpg", style: "outdoor-urban", styleName: "Urban Professional", variant: 1 },
  { filename: "172d9e54-3891-4110-96b1-3c2da2ba7034-outdoor-urban-v2.jpg", style: "outdoor-urban", styleName: "Urban Professional", variant: 2 },
  { filename: "e5f47490-0ae4-483a-b934-b1bc4c3c6b21-corporate-navy-v1.jpg", style: "corporate-navy", styleName: "Corporate Navy", variant: 1 },
  { filename: "d50d9d23-3ce1-48bd-a186-7817052c7802-corporate-gray-v1.jpg", style: "corporate-gray", styleName: "Corporate Gray", variant: 1 },
  { filename: "f41cbef4-2729-433c-a3b6-4744b0b4b4a7-corporate-gray-v2.jpg", style: "corporate-gray", styleName: "Corporate Gray", variant: 2 },
  { filename: "ce8c8be2-2223-4bbb-ac3f-d75d325bf724-executive-black-v1.jpg", style: "executive-black", styleName: "Executive Black", variant: 1 },
  { filename: "e008f70b-a775-4703-93a4-1944d8b2e7bb-executive-black-v2.jpg", style: "executive-black", styleName: "Executive Black", variant: 2 },
  { filename: "29806279-05a5-4e96-93df-a89765d003f4-casual-blue-shirt-v1.jpg", style: "casual-blue-shirt", styleName: "Blue Oxford", variant: 1 },
  { filename: "f194053f-8929-4ce1-b4a5-8eb18ab64e15-casual-blue-shirt-v2.jpg", style: "casual-blue-shirt", styleName: "Blue Oxford", variant: 2 },
  { filename: "6053feda-8624-43cc-92a8-8417e3be6178-tech-startup-v1.jpg", style: "tech-startup", styleName: "Tech Startup", variant: 1 },
  { filename: "2a6b32e0-4c97-4fd5-966d-375a2c5aa901-finance-exec-v1.jpg", style: "finance-exec", styleName: "Finance Executive", variant: 1 },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  // Only allow demo images for the specific demo order
  if (orderId !== DEMO_ORDER_ID) {
    return NextResponse.json({ error: "Not a demo order" }, { status: 403 });
  }

  // Return hardcoded demo images
  const images = DEMO_IMAGES.map((img, index) => ({
    id: `demo-${index}`,
    style: img.style,
    styleName: img.styleName + (img.variant > 1 ? ` #${img.variant}` : ""),
    imageUrl: `${SUPABASE_STORAGE_BASE}/${img.filename}`,
    quality: "standard" as const,
  }));

  return NextResponse.json({
    success: true,
    images,
    count: images.length,
  });
}
