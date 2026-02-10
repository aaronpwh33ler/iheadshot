"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { InstantUpload, type GeneratedImage } from "@/components/InstantUpload";
import { ResultsGallery } from "@/components/ResultsGallery";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Camera, Crown, Zap } from "lucide-react";

// Demo mode order ID — skips API calls, uses default tier/count
const DEMO_ORDER_ID = "cs_test_a10w4eDn4CKk4FR9IgZh6bhHoaQpgMVuXjLs35oUdR6xC6wnA96VUPLTUP";

export default function UploadPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const isDemoMode = orderId === DEMO_ORDER_ID;
  const [order, setOrder] = useState<{ tier: string; headshot_count: number } | null>(
    isDemoMode ? { tier: "standard", headshot_count: 10 } : null
  );
  const [loading, setLoading] = useState(!isDemoMode);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Demo mode: skip API call entirely
    if (isDemoMode) return;

    async function fetchOrder() {
      try {
        const response = await fetch(`/api/status/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);

          // If images already exist, show them
          if (data.images && data.images.length > 0) {
            setGeneratedImages(
              data.images.map((img: { id: string; image_url: string; style?: string; style_name?: string; quality?: string }) => ({
                id: img.id,
                style: img.style || "corporate",
                styleName: img.style_name || "Professional",
                imageUrl: img.image_url,
                quality: img.quality || "standard",
              }))
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, isDemoMode]);

  const handleGenerationComplete = (images: GeneratedImage[]) => {
    setGeneratedImages(images);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  const tier = order?.tier || "basic";
  const headshotCount = order?.headshot_count || 5;
  const isPremium = tier === "premium";
  const isStandard = tier === "standard";

  // Show results gallery if we have generated images
  if (generatedImages && generatedImages.length > 0) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 bg-green-100 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Headshots Are Ready!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Download your favorites and use them on LinkedIn, resumes, or anywhere you need a professional photo.
            </p>
          </div>

          <ResultsGallery
            images={generatedImages}
            orderId={orderId}
            tier={tier}
          />

          <p className="text-center text-sm text-gray-500 mt-8">
            Your photos will be available for 30 days. Make sure to download your favorites!
          </p>
        </div>
      </div>
    );
  }

  // Show upload interface
  return (
    <div className="py-8 min-h-screen bg-white">
      {/* Full-width container for the upload flow */}
      <div className="container mx-auto px-4">
        <InstantUpload
          orderId={orderId}
          tier={tier}
          headshotCount={headshotCount}
          onGenerationComplete={handleGenerationComplete}
          onError={handleError}
        />

        <p className="text-center text-sm text-gray-400 mt-8">
          Order ID: {orderId}
        </p>
      </div>
    </div>
  );
}
