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

// Pricing structure - bulk should always be cheaper than individual total
const PRICING = {
  basic: { all: 4.99, individual: 1.99 },      // 5 images: $4.99 all vs $9.95 individual (save $4.96)
  standard: { all: 9.99, individual: 1.49 },   // 10 images: $9.99 all vs $14.90 individual (save $4.91)
  premium: { all: 14.99, individual: 1.29 },   // 20 images: $14.99 all vs $25.80 individual (save $10.81)
};

export function ResultsGallery({ images, orderId, tier = "basic" }: ResultsGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [localImages, setLocalImages] = useState(images);
  const [upscaledIds, setUpscaledIds] = useState<Set<string>>(new Set());

  // Upscale modal state
  const [upscaleModalImage, setUpscaleModalImage] = useState<GeneratedImage | null>(null);
  const [upscaleModalOriginalUrl, setUpscaleModalOriginalUrl] = useState<string | null>(null); // Store original for before/after
  const [showBulkUpscaleModal, setShowBulkUpscaleModal] = useState(false);
  const [upscalingCurrent, setUpscalingCurrent] = useState(false);
  const [upscalingAll, setUpscalingAll] = useState(false);
  const [processingImageUrl, setProcessingImageUrl] = useState<string | null>(null); // For processing overlay
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upscaling failed");
      }

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
      const message = error instanceof Error ? error.message : "Failed to upscale images";
      alert(message);
    } finally {
      setUpscalingAll(false);
    }
  };

  const upscaleSingle = async (image: GeneratedImage) => {
    setUpscalingCurrent(true);
    setProcessingImageUrl(image.imageUrl); // Show processing overlay
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upscaling failed");
      }

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
      const message = error instanceof Error ? error.message : "Failed to upscale image";
      alert(message);
    } finally {
      setUpscalingCurrent(false);
      setProcessingImageUrl(null); // Hide processing overlay
    }
  };

  const openUpscaleModal = (image: GeneratedImage) => {
    setUpscaleModalImage(image);
    setUpscaleModalOriginalUrl(image.imageUrl); // Store original URL for before/after comparison
    setSliderPosition(50);
  };

  const closeUpscaleModal = () => {
    setUpscaleModalImage(null);
    setUpscaleModalOriginalUrl(null);
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
              onClick={() => setShowBulkUpscaleModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Zap className="h-4 w-4 mr-2" />
              4K Upscale All
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

      {/* Upscaling Progress Indicator */}
      {(upscalingAll || upscalingCurrent) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {upscalingAll ? "Upscaling all images to 4K..." : "Upscaling image to 4K..."}
            </p>
            <p className="text-sm text-gray-600">
              This may take a minute. Please don&apos;t close this page.
            </p>
          </div>
          <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
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
                    className="h-8 px-2 bg-green-500 hover:bg-green-600 text-xs font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      openUpscaleModal(image);
                    }}
                  >
                    4K
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
              {/* "Before" - Always show the ORIGINAL image */}
              <div className="absolute inset-0">
                <img
                  src={upscaleModalOriginalUrl || upscaleModalImage.imageUrl}
                  alt="Original"
                  className="w-full h-full object-cover"
                  draggable={false}
                  style={{
                    filter: "blur(0.5px)",
                    imageRendering: "pixelated"
                  }}
                />
                {/* "Before" label with resolution */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                  <span className="bg-gray-600 px-2 py-0.5 rounded text-xs">720p</span>
                  Standard
                </div>
              </div>

              {/* "After" - 4K version (actual upscaled or preview) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
              >
                {upscaledIds.has(upscaleModalImage.id) ? (
                  // Already upscaled - show the actual 4K image
                  <img
                    src={upscaleModalImage.imageUrl}
                    alt="4K"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  // Not yet upscaled - show blurred preview with overlay
                  <>
                    <img
                      src={upscaleModalOriginalUrl || upscaleModalImage.imageUrl}
                      alt="4K Preview"
                      className="w-full h-full object-cover blur-sm"
                      draggable={false}
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

              {/* Processing Overlay - shows when upscaling */}
              {processingImageUrl && (
                <div className="absolute inset-0 z-20">
                  {/* Blurred image with green tint */}
                  <img
                    src={processingImageUrl}
                    alt="Processing"
                    className="w-full h-full object-cover blur-md"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/40 to-emerald-600/40" />

                  {/* Scanning line effect */}
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-bounce"
                    style={{ top: "50%", animationDuration: "1.5s" }}
                  />

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 relative">
                        <Zap className="w-16 h-16 text-green-400 animate-pulse" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-green-400/30 rounded-full animate-ping" />
                      </div>
                      <h3 className="text-white text-xl font-bold mb-2">Enhancing to 4K</h3>
                      <p className="text-green-200 text-sm">AI processing in progress...</p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                        <span className="text-white/80 text-sm">This may take a moment</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                // Not yet upscaled - individual pricing only
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-gray-900">${pricing.individual}</p>
                    <p className="text-sm text-gray-600">per image</p>
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
                          Upscale to 4K — ${pricing.individual}
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

      {/* Bulk Upscale Modal */}
      {showBulkUpscaleModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowBulkUpscaleModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Upgrade All to 4K Resolution</h3>
                <p className="text-sm text-gray-600">{localImages.length} images will be processed</p>
              </div>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowBulkUpscaleModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview Grid */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {localImages.slice(0, 5).map((image, i) => (
                  <div key={image.id} className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 relative">
                    <img src={image.imageUrl} alt={image.styleName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-500/30 to-transparent flex items-end justify-center pb-2">
                      <span className="text-white text-xs font-bold bg-green-500 px-2 py-0.5 rounded">4K</span>
                    </div>
                  </div>
                ))}
              </div>
              {localImages.length > 5 && (
                <p className="text-center text-sm text-gray-500">+ {localImages.length - 5} more images</p>
              )}
            </div>

            {/* Pricing with Discount */}
            <div className="p-6 border-t">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Bulk Discount Applied!</span>
                  </div>
                  <Badge className="bg-green-500 text-white">Save ${savings}</Badge>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">${pricing.all}</span>
                  <span className="text-lg text-gray-400 line-through">${totalIndividualCost}</span>
                  <span className="text-sm text-gray-600">for all {localImages.length} images</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Individual price: ${pricing.individual}/image × {localImages.length} = ${totalIndividualCost}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowBulkUpscaleModal(false)} className="flex-1">
                  Maybe Later
                </Button>
                <Button
                  onClick={() => {
                    setShowBulkUpscaleModal(false);
                    upscaleAll();
                  }}
                  disabled={upscalingAll}
                  className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {upscalingAll ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Upscaling All...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Upscale All {localImages.length} Images to 4K
                    </>
                  )}
                </Button>
              </div>
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
