"use client";

import { useEffect, useState, use } from "react";
import { ImageGallery } from "@/components/ImageGallery";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface Image {
  id: string;
  url: string;
  style?: string;
}

export default function GalleryPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch(`/api/status/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();

        if (data.status !== "completed") {
          setError("Your headshots are still being generated. Please wait.");
          return;
        }

        if (data.images) {
          setImages(
            data.images.map((img: { id: string; image_url: string; style?: string }) => ({
              id: img.id,
              url: img.image_url,
              style: img.style,
            }))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Card className="p-8">
            <p className="text-gray-600">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Complete
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Headshots Are Ready!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download your favorites and use them on LinkedIn, resumes, or
            anywhere else you need a professional photo.
          </p>
        </div>

        <ImageGallery images={images} orderId={orderId} />

        <p className="text-center text-sm text-gray-500 mt-8">
          Your photos will be available for 30 days. Make sure to download your
          favorites!
        </p>
      </div>
    </div>
  );
}
