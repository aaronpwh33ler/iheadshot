"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstantUploadProps {
  orderId: string;
  onGenerationComplete: (images: GeneratedImage[]) => void;
  onError: (error: string) => void;
}

export interface GeneratedImage {
  id: string;
  style: string;
  styleName: string;
  imageUrl: string;
  quality: "standard" | "premium";
}

export function InstantUpload({
  orderId,
  onGenerationComplete,
  onError,
}: InstantUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled: generating,
  });

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
  };

  const generateHeadshots = async () => {
    if (!file) return;

    setGenerating(true);
    setError(null);
    setStatus("Uploading your photo...");

    try {
      // Step 1: Upload the photo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", orderId);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload photo");
      }

      const { url: imageUrl } = await uploadResponse.json();

      // Step 2: Generate headshots instantly
      setStatus("AI is creating your headshots... (about 30 seconds)");

      const generateResponse = await fetch("/api/generate-instant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          imageUrl,
          styles: ["corporate", "business-casual", "creative", "outdoor", "executive"],
          quality: "standard",
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to generate headshots");
      }

      const data = await generateResponse.json();

      if (data.success && data.images) {
        onGenerationComplete(data.images);
      } else {
        throw new Error("Generation failed - no images returned");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setGenerating(false);
      setStatus("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload area or preview */}
      {!file ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${isDragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
          `}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="h-10 w-10 text-white" />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">
            {isDragActive ? "Drop your photo here" : "Upload your best selfie"}
          </p>
          <p className="text-gray-500 mb-4">
            Just one photo - we'll create 5 professional styles instantly
          </p>
          <p className="text-sm text-gray-400">
            JPG, PNG, or WebP up to 10MB
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
            <img
              src={preview!}
              alt="Your photo"
              className="w-full h-full object-cover"
            />
          </div>
          {!generating && (
            <button
              onClick={removeFile}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Status message during generation */}
      {generating && status && (
        <div className="flex items-center justify-center gap-3 text-blue-600 bg-blue-50 p-4 rounded-xl">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="font-medium">{status}</p>
        </div>
      )}

      {/* Generate button */}
      {file && !generating && (
        <Button
          onClick={generateHeadshots}
          size="lg"
          className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Generate My Headshots
        </Button>
      )}

      {/* Photo tips */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">For best results:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-green-700">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Clear, well-lit face
            </p>
            <p className="flex items-center gap-2 text-green-700">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Front-facing or slight angle
            </p>
            <p className="flex items-center gap-2 text-green-700">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Neutral expression or smile
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-red-600">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              No sunglasses
            </p>
            <p className="flex items-center gap-2 text-red-600">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              No heavy filters
            </p>
            <p className="flex items-center gap-2 text-red-600">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              No group photos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
