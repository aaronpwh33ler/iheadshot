"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, ChevronLeft, ChevronRight, Grid, LayoutGrid } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface Image {
  id: string;
  url: string;
  style?: string;
}

interface ImageGalleryProps {
  images: Image[];
  orderId: string;
}

export function ImageGallery({ images, orderId }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid");

  const downloadAll = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("headshots");

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const response = await fetch(image.url);
        const blob = await response.blob();
        const extension = image.url.split(".").pop() || "jpg";
        folder?.file(`headshot-${i + 1}.${extension}`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `headshots-${orderId}.zip`);
    } catch (error) {
      console.error("Failed to download:", error);
    } finally {
      setDownloading(false);
    }
  };

  const downloadSingle = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const extension = url.split(".").pop() || "jpg";
      saveAs(blob, `headshot-${index + 1}.${extension}`);
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (selectedIndex === null) return;
    if (direction === "prev") {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    } else {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Headshots</h2>
          <p className="text-gray-600">{images.length} professional headshots ready for download</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-100" : ""}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("large")}
              className={`p-2 rounded ${viewMode === "large" ? "bg-gray-100" : ""}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={downloadAll} disabled={downloading}>
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Preparing..." : "Download All"}
          </Button>
        </div>
      </div>

      <div
        className={`grid gap-4 ${
          viewMode === "grid"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        }`}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.url}
              alt={`Headshot ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSingle(image.url, index);
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            {image.style && (
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs bg-black/50 text-white px-2 py-1 rounded">
                  {image.style}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("prev");
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("next");
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div
            className="max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex].url}
              alt={`Headshot ${selectedIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 flex items-center justify-between text-white">
              <span>
                {selectedIndex + 1} of {images.length}
              </span>
              <Button
                variant="secondary"
                onClick={() => downloadSingle(images[selectedIndex].url, selectedIndex)}
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
