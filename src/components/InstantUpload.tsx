"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Sparkles, AlertCircle, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

interface FileWithPreview extends File {
  preview: string;
}

export function InstantUpload({
  orderId,
  onGenerationComplete,
  onError,
}: InstantUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const newFiles = acceptedFiles.slice(0, 5).map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
    disabled: generating,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const generateHeadshots = async () => {
    if (files.length === 0) return;

    setGenerating(true);
    setError(null);
    setStatus("Uploading your photo(s)...");
    setProgress(5);

    try {
      // Step 1: Upload all photos
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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

        const { url } = await uploadResponse.json();
        uploadedUrls.push(url);
        setProgress(10 + (i / files.length) * 10);
      }

      // Step 2: Generate headshots
      setStatus("AI is creating your headshots... This takes 2-5 minutes for best quality.");
      setProgress(25);

      const generateResponse = await fetch("/api/generate-instant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          imageUrl: uploadedUrls[0],
          imageUrls: uploadedUrls,
          quality: "standard",
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to generate headshots");
      }

      setProgress(90);
      setStatus("Finalizing your headshots...");

      const data = await generateResponse.json();

      if (data.success && data.images) {
        setProgress(100);
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
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {files.length === 0 ? (
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
            {isDragActive ? "Drop your photos here" : "Upload your photos"}
          </p>
          <p className="text-gray-500 mb-4">
            1-5 photos for best results. More photos = better accuracy!
          </p>
          <p className="text-sm text-gray-400">
            JPG, PNG, or WebP up to 10MB each
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Photo previews */}
          <div className="flex flex-wrap gap-3 justify-center">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                  <img
                    src={file.preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {!generating && (
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Add more photos button */}
            {files.length < 5 && !generating && (
              <div
                {...getRootProps()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors"
              >
                <input {...getInputProps()} />
                <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Add more</span>
              </div>
            )}
          </div>

          {/* Photo count info */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{files.length}</span> photo{files.length !== 1 ? "s" : ""} selected
              {files.length === 1 && (
                <span className="text-amber-600 ml-2">
                  (Add more for better accuracy!)
                </span>
              )}
              {files.length >= 3 && (
                <span className="text-green-600 ml-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Great for accuracy!
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Progress during generation */}
      {generating && (
        <div className="space-y-4 bg-blue-50 p-6 rounded-xl">
          <div className="flex items-center justify-center gap-3 text-blue-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="font-medium">{status}</p>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-blue-600">
            Please don't close this page. Your headshots are being created!
          </p>
        </div>
      )}

      {/* Generate button */}
      {files.length > 0 && !generating && (
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
              Multiple photos (2-5 best)
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
