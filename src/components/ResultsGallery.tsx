"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  Loader2,
  Zap,
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface GeneratedImage {
  id: string;
  style: string;
  styleName: string;
  imageUrl: string;
  quality: "standard" | "premium";
}

interface ResultsGalleryProps {
  images: GeneratedImage[];
  orderId: string;
}

export function ResultsGallery({ images, orderId }: ResultsGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [upscalingImages, setUpscalingImages] = useState(false);
  const [localImages, setLocalImages] = useState(images);

  const downloadAll = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("headshots");

      for (let i = 0; i < localImages.length; i++) {
        const image = localImages[i];
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        const extension = image.imageUrl.includes(".png") ? "png" : "webp";
        folder?.file(`${image.styleName.toLowerCase().replace(/\s+/g, "-")}.${extension}`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `headshots-${orderId}.zip`);
    } catch (error) {
      console.error("Failed to download:", error);
    } finally {
      setDownloading(false);
    }
  };

  const downloadSingle = async (image: GeneratedImage, index: number) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const extension = image.imageUrl.includes(".png") ? "png" : "webp";
      saveAs(blob, `${image.styleName.toLowerCase().replace(/\s+/g, "-")}.${extension}`);
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const upscaleAll = async () => {
    setUpscalingImages(true);
    try {
      const imageUrls = localImages.map((img) => img.imageUrl);
      const response = await fetch("/api/upscale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          imageUrls,
          scale: 4,
        }),
      });

      if (!response.ok) throw new Error("Upscaling failed");

      const data = await response.json();
      if (data.images && data.images.length > 0) {
        // Update local images with upscaled versions
        setLocalImages((prev) =>
          prev.map((img) => {
            const upscaled = data.images.find(
              (u: { originalUrl: string; upscaledUrl: string }) => u.originalUrl === img.imageUrl
            );
            return upscaled ? { ...img, imageUrl: upscaled.upscaledUrl } : img;
          })
        );
        alert(`Successfully upscaled ${data.images.length} images to 4K!`);
      }
    } catch (error) {
      console.error("Upscaling failed:", error);
      alert("Failed to upscale images. Please try again.");
    } finally {
      setUpscalingImages(false);
    }
  };

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const navigateLightbox = (direction: "prev" | "next") => {
    if (selectedIndex === null) return;
    if (direction === "prev") {
      setSelectedIndex(selectedIndex === 0 ? localImages.length - 1 : selectedIndex - 1);
    } else {
      setSelectedIndex(selectedIndex === localImages.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Headshots</h2>
          <p className="text-gray-600">{localImages.length} professional styles ready</p>
        </div>

        <Button onClick={downloadAll} disabled={downloading} size="lg">
          <Download className="h-4 w-4 mr-2" />
          {downloading ? "Preparing..." : "Download All"}
        </Button>
      </div>

      {/* Upsell card */}
      <div className="max-w-xl">
        {/* 4K Upscaling Upsell */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Maximize2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">4K Upscaling with Topaz AI</h3>
              <p className="text-sm text-gray-600 mb-3">
                Upscale all your headshots to print-quality 4K resolution using industry-leading Topaz Bloom AI.
              </p>
              <p className="text-lg font-bold text-green-600 mb-3">$9.99 for all images</p>
              <Button
                onClick={upscaleAll}
                disabled={upscalingImages}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {upscalingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upscaling...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Upscale All to 4K
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {localImages.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.imageUrl}
              alt={image.styleName}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Quality badge */}
            {image.quality === "premium" && (
              <Badge className="absolute top-2 left-2 bg-purple-600">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}

            {/* Style name */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium">{image.styleName}</p>
            </div>

            {/* Hover actions */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Download button */}
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSingle(image, index);
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("prev");
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("next");
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img
                src={localImages[selectedIndex].imageUrl}
                alt={localImages[selectedIndex].styleName}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
              {localImages[selectedIndex].quality === "premium" && (
                <Badge className="absolute top-4 left-4 bg-purple-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium Quality
                </Badge>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between text-white">
              <div>
                <span className="text-lg font-medium">{localImages[selectedIndex].styleName}</span>
                <span className="text-gray-400 ml-4">
                  {selectedIndex + 1} of {localImages.length}
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={() => downloadSingle(localImages[selectedIndex], selectedIndex)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
