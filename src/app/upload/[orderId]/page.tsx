"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { InstantUpload, type GeneratedImage } from "@/components/InstantUpload";
import { ResultsGallery } from "@/components/ResultsGallery";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Camera, Crown, Zap } from "lucide-react";

export default function UploadPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const [order, setOrder] = useState<{ tier: string; headshot_count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [orderId]);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
          />

          <p className="text-center text-sm text-gray-500 mt-8">
            Your photos will be available for 30 days. Make sure to download your favorites!
          </p>
        </div>
      </div>
    );
  }

  // Tier-specific styling
  const tierGradient = isPremium
    ? "from-amber-500 to-orange-600"
    : isStandard
    ? "from-purple-500 to-blue-600"
    : "from-blue-500 to-purple-600";

  const tierBgGradient = isPremium
    ? "from-amber-50 to-orange-50"
    : isStandard
    ? "from-purple-50 to-blue-50"
    : "from-gray-50 to-white";

  // Show upload interface
  return (
    <div className={`py-12 min-h-screen bg-gradient-to-b ${tierBgGradient}`}>
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${tierGradient} rounded-2xl mb-6 shadow-lg`}>
            {isPremium ? <Crown className="h-8 w-8 text-white" /> : <Camera className="h-8 w-8 text-white" />}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Create Your {isPremium ? "Premium " : ""}Headshots
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Upload 1-5 photos and our AI will create {headshotCount} professional headshot styles.
          </p>
        </div>

        <Card className="p-6 md:p-8 shadow-xl border-0">
          <InstantUpload
            orderId={orderId}
            tier={tier}
            headshotCount={headshotCount}
            onGenerationComplete={handleGenerationComplete}
            onError={handleError}
          />
        </Card>

        {/* Features list - updated without 30 seconds claim */}
        <div className="mt-10 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className={`w-12 h-12 ${isPremium ? "bg-amber-100" : "bg-blue-100"} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <Sparkles className={`h-6 w-6 ${isPremium ? "text-amber-600" : "text-blue-600"}`} />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">AI-Powered</h3>
            <p className="text-sm text-gray-500">{isPremium ? "Premium 4K Model" : "Latest FLUX AI"}</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{headshotCount} Styles</h3>
            <p className="text-sm text-gray-500">Professional variety</p>
          </div>
          <div>
            <div className={`w-12 h-12 ${isPremium ? "bg-orange-100" : "bg-purple-100"} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <Zap className={`h-6 w-6 ${isPremium ? "text-orange-600" : "text-purple-600"}`} />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Fast Results</h3>
            <p className="text-sm text-gray-500">Ready in minutes</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Order ID: {orderId}
        </p>
      </div>
    </div>
  );
}
