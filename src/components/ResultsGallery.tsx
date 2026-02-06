"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Check,
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
  tier?: string;
}

// Pricing structure
const PRICING = {
  basic: { all: 9.99, individual: 2.49 },      // 5 images: $9.99 all vs $12.45 individual
  standard: { all: 14.99, individual: 1.99 },  // 10 images: $14.99 all vs $19.90 individual
  premium: { all: 24.99, individual: 1.49 },   // 20 images: $24.99 all vs $29.80 individual
};

export function ResultsGallery({ images, orderId, tier = "basic" }: ResultsGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [localImages, setLocalImages] = useState(images);
  const [upscaledIds, setUpscaledIds] = useState<Set<string>>(new Set());

  // Upscale modal state
  const [upscaleModalImage, setUpscaleModalImage] = useState<GeneratedImage | null>(null);
  const [upscalingCurrent, setUpscalingCurrent] = useState(false);
  const [upscalingAll, setUpscalingAll] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const pricing = PRICING[tier as keyof typeof PRICING] || PRICING.basic;
  const totalIndividualCost = (pricing.individual * localImages.length).toFixed(2);
  const savings = (parseFloat(totalIndividualCost) - pricing.all).toFixed(2);

  // Slider drag handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleSliderMouseDown = () => {
    isDragging.current = true;
  };

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
        const suffix = upscaledIds.has(image.id) ? "-4k" : "";
        folder?.file(`${image.styleName.toLowerCase().replace(/\s+/g, "-")}${suffix}.${extension}`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `headshots-${orderId}.zip`);
    } catch (error) {
      console.error("Failed to download:", error);
    } finally {
      setDownloading(false);
    }
  };

  const downloadSingle = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const extension = image.imageUrl.includes(".png") ? "png" : "webp";
      const suffix = upscaledIds.has(image.id) ? "-4k" : "";
      saveAs(blob, `${image.styleName.toLowerCase().replace(/\s+/g, "-")}${suffix}.${extension}`);
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const upscaleAll = async () => {
    setUpscalingAll(true);
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
        // Mark all as upscaled
        setUpscaledIds(new Set(localImages.map(img => img.id)));
      }
    } catch (error) {
      console.error("Upscaling failed:", error);
      alert("Failed to upscale images. Please try again.");
    } finally {
      setUpscalingAll(false);
    }
  };

  const upscaleSingle = async (image: GeneratedImage) => {
    setUpscalingCurrent(true);
    try {
      const response = await fetch("/api/upscale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          imageUrls: [image.imageUrl],
          scale: 4,
        }),
      });

      if (!response.ok) throw new Error("Upscaling failed");

      const data = await response.json();
      if (data.images && data.images.length > 0) {
        const upscaled = data.images[0];
        // Update the specific image
        setLocalImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, imageUrl: upscaled.upscaledUrl } : img
          )
        );
        // Mark as upscaled
        setUpscaledIds((prev) => new Set([...prev, image.id]));
        // Update modal image
        setUpscaleModalImage((prev) =>
          prev ? { ...prev, imageUrl: upscaled.upscaledUrl } : null
        );
      }
    } catch (error) {
      console.error("Upscaling failed:", error);
      alert("Failed to upscale image. Please try again.");
    } finally {
      setUpscalingCurrent(false);
    }
  };

  const openUpscaleModal = (image: GeneratedImage) => {
    setUpscaleModalImage(image);
    setSliderPosition(50);
  };

  const closeUpscaleModal = () => {
    setUpscaleModalImage(null);
    setUpscalingCurrent(false);
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

  const allUpscaled = upscaledIds.size === localImages.length;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Headshots</h2>
          <p className="text-gray-600">{localImages.length} professional styles ready</p>
        </div>

        <div className="flex gap-3">
          {/* 4K Upscale All Button */}
          {!allUpscaled && (
            <Button
              onClick={upscaleAll}
              disabled={upscalingAll}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {upscalingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upscaling...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  4K Upscale All — ${pricing.all}
                </>
              )}
            </Button>
          )}

          {allUpscaled && (
            <Badge className="bg-green-100 text-green-700 px-4 py-2">
              <Check className="h-4 w-4 mr-1" />
              All Upscaled to 4K
            </Badge>
          )}

          {/* Download All Button */}
          <Button onClick={downloadAll} disabled={downloading} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Preparing..." : "Download All"}
          </Button>
        </div>
      </div>

      {/* Savings banner - only show if not all upscaled */}
      {!allUpscaled && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Maximize2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Upscale all to 4K and save ${savings}!</p>
              <p className="text-sm text-gray-600">
                Individual: ${pricing.individual}/image (${totalIndividualCost} total) → Bulk: ${pricing.all}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {localImages.map((image, index) => {
          const isUpscaled = upscaledIds.has(image.id);
          return (
            <div
              key={image.id}
              className={`group relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all ${
                isUpscaled ? "ring-2 ring-green-500 ring-offset-2" : ""
              }`}
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.imageUrl}
                alt={image.styleName}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />

              {/* Upscaled badge */}
              {isUpscaled && (
                <Badge className="absolute top-2 left-2 bg-green-500">
                  <Zap className="h-3 w-3 mr-1" />
                  4K
                </Badge>
              )}

              {/* Quality badge */}
              {image.quality === "premium" && !isUpscaled && (
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
                {/* 4K Button */}
                {!isUpscaled && (
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      openUpscaleModal(image);
                    }}
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                )}

                {/* Download button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSingle(image);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upscale Modal with Before/After Slider */}
      {upscaleModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeUpscaleModal}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Upgrade to 4K Resolution</h3>
                <p className="text-sm text-gray-600">{upscaleModalImage.styleName}</p>
              </div>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={closeUpscaleModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Before/After Comparison */}
            <div
              ref={sliderRef}
              className="relative aspect-[4/5] bg-gray-900 overflow-hidden cursor-ew-resize select-none"
              onMouseDown={handleSliderMouseDown}
            >
              {/* "Before" - Original with slight pixelation effect */}
              <div className="absolute inset-0">
                <img
                  src={upscaleModalImage.imageUrl}
                  alt="Original"
                  className="w-full h-full object-cover"
                  style={{
                    filter: upscaledIds.has(upscaleModalImage.id) ? "none" : "blur(0.5px)",
                    imageRendering: upscaledIds.has(upscaleModalImage.id) ? "auto" : "pixelated"
                  }}
                />
                {/* "Before" label */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Standard
                </div>
              </div>

              {/* "After" - 4K preview (blurred with overlay if not purchased) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
              >
                {upscaledIds.has(upscaleModalImage.id) ? (
                  // Already upscaled - show full quality
                  <img
                    src={upscaleModalImage.imageUrl}
                    alt="4K"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Not yet upscaled - show blurred preview
                  <>
                    <img
                      src={upscaleModalImage.imageUrl}
                      alt="4K Preview"
                      className="w-full h-full object-cover blur-sm"
                    />
                    {/* 4K Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="bg-green-500 text-white text-4xl font-bold px-6 py-3 rounded-xl shadow-lg">
                          4K
                        </div>
                        <p className="text-white text-sm mt-2 bg-black/50 px-3 py-1 rounded-full">
                          Ultra HD Quality
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {/* "After" label */}
                <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  4K Enhanced
                </div>
              </div>

              {/* Slider handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="flex gap-0.5">
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Drag instruction */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                ← Drag to compare →
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t">
              {upscaledIds.has(upscaleModalImage.id) ? (
                // Already upscaled
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Upscaled to 4K!</span>
                  </div>
                  <Button onClick={() => downloadSingle(upscaleModalImage)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download 4K
                  </Button>
                </div>
              ) : (
                // Not yet upscaled
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-gray-900">${pricing.individual}</p>
                    <p className="text-sm text-gray-600">
                      or <span className="text-green-600 font-medium">${pricing.all} for all {localImages.length} images</span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={closeUpscaleModal}>
                      Maybe Later
                    </Button>
                    <Button
                      onClick={() => upscaleSingle(upscaleModalImage)}
                      disabled={upscalingCurrent}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {upscalingCurrent ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Upscaling...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Upscale to 4K
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              {upscaledIds.has(localImages[selectedIndex].id) && (
                <Badge className="absolute top-4 left-4 bg-green-500">
                  <Zap className="h-3 w-3 mr-1" />
                  4K Enhanced
                </Badge>
              )}
              {localImages[selectedIndex].quality === "premium" && !upscaledIds.has(localImages[selectedIndex].id) && (
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
              <div className="flex gap-3">
                {!upscaledIds.has(localImages[selectedIndex].id) && (
                  <Button
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      closeLightbox();
                      openUpscaleModal(localImages[selectedIndex]);
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Upscale to 4K
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => downloadSingle(localImages[selectedIndex])}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
