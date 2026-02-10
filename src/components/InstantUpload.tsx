"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Sparkles, AlertCircle, Loader2, CheckCircle2, Image as ImageIcon, AlertTriangle, Crown, ChevronRight, ChevronLeft, Wand2, Camera, Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StyleSelector, SelectedStyle, PRESET_STYLES, getPreviewImagePath } from "./StyleSelector";

// Demo mode: Skip generation and show existing images for testing
const DEMO_ORDER_ID = "cs_test_a10w4eDn4CKk4FR9IgZh6bhHoaQpgMVuXjLs35oUdR6xC6wnA96VUPLTUP";

interface InstantUploadProps {
  orderId: string;
  tier?: string;
  headshotCount?: number;
  onGenerationComplete: (images: GeneratedImage[]) => void;
  onError: (error: string) => void;
}

export interface GeneratedImage {
  id: string;
  style: string;
  styleName: string;
  imageUrl: string;
  quality: "standard" | "premium";
  variant?: number;
}

interface FileWithPreview extends File {
  preview: string;
}

// Note: Style categories are now defined in StyleSelector component

type Step = "upload" | "select" | "generate";
type GenerationPhase = "idle" | "uploading" | "character-sheet" | "generating";

// Always compress/resize images client-side before upload.
// AI headshot generation only needs ~1024px; this keeps uploads well under Vercel's 4.5MB limit.
function compressImage(file: File, maxDimension = 1024, quality = 0.80): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down to maxDimension on longest side
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fall back to original on error
    };

    img.src = url;
  });
}

export function InstantUpload({
  orderId,
  tier = "basic",
  headshotCount = 5,
  onGenerationComplete,
  onError,
}: InstantUploadProps) {
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<SelectedStyle[]>([]);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>("idle");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentGenerating, setCurrentGenerating] = useState<string | null>(null);
  const [currentVariant, setCurrentVariant] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [overLimitWarning, setOverLimitWarning] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [characterSheetUrl, setCharacterSheetUrl] = useState<string | null>(null);
  const [characterSheetBase64, setCharacterSheetBase64] = useState<string | null>(null);
  const [detectedGender, setDetectedGender] = useState<"male" | "female">("male");
  const [loadingDemoImages, setLoadingDemoImages] = useState(false);

  // Demo mode detection
  const isDemoMode = orderId === DEMO_ORDER_ID;

  const isPremium = tier === "premium";
  const isStandard = tier === "standard";
  const totalImages = headshotCount;

  // Demo mode: Create fake GeneratedImage[] from selected styles using preview images
  const generateDemoImages = () => {
    const demoImages: GeneratedImage[] = selectedStyles.map((style) => ({
      id: style.id,
      style: style.id,
      styleName: style.name,
      imageUrl: getPreviewImagePath(style.id, detectedGender) || `/style-previews/male/${style.id}.jpg`,
      quality: "standard" as const,
    }));
    return demoImages;
  };

  // In demo mode, fetch existing images from database
  const loadDemoImages = async () => {
    setLoadingDemoImages(true);
    try {
      const response = await fetch(`/api/demo-images?orderId=${orderId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          onGenerationComplete(data.images);
        }
      }
    } catch (err) {
      console.error("Failed to load demo images:", err);
    } finally {
      setLoadingDemoImages(false);
    }
  };

  // Get total allocated images from selected styles
  const getAllocatedImages = () => {
    return selectedStyles.reduce((sum, s) => sum + s.quantity, 0);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const totalFiles = files.length + acceptedFiles.length;
    if (totalFiles > 5) {
      setOverLimitWarning(true);
      const remaining = 5 - files.length;
      acceptedFiles = acceptedFiles.slice(0, remaining);
    }
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: generating || uploading,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    setOverLimitWarning(false);
  };

  // Step 1: Upload photos (or skip in demo mode)
  const handleUploadComplete = async () => {
    // Demo mode: skip upload, go to style selection
    if (isDemoMode) {
      setStep("select");
      setSelectedStyles([]); // Start with no styles selected
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        // Compress/resize for optimal AI processing
        const compressed = await compressImage(file);

        // Step 1: Get a signed upload URL (small JSON request — no file data through Vercel)
        const urlResponse = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            fileName: file.name,
            contentType: compressed.type,
          }),
        });
        if (!urlResponse.ok) {
          const errorData = await urlResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload failed (${urlResponse.status})`);
        }
        const { signedUrl, token, publicUrl } = await urlResponse.json();

        // Step 2: Upload directly to Supabase Storage (bypasses Vercel body limit)
        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": compressed.type || "image/jpeg" },
          body: compressed,
        });
        if (!uploadResponse.ok) {
          throw new Error(`Direct upload failed (${uploadResponse.status})`);
        }

        urls.push(publicUrl);
      }
      setUploadedUrls(urls);

      // Detect gender from first uploaded photo (for style thumbnails & outfit prompts)
      try {
        const genderResponse = await fetch("/api/detect-gender", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: urls[0] }),
        });
        if (genderResponse.ok) {
          const { gender } = await genderResponse.json();
          setDetectedGender(gender || "male");
        }
      } catch (genderErr) {
        console.error("Gender detection failed, defaulting to male:", genderErr);
        // Keep default "male" — non-blocking error
      }

      setStep("select");
      setSelectedStyles([]); // Start with no styles selected
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Main generation workflow with character sheet
  const generateHeadshots = async () => {
    // Demo mode: create fake GeneratedImage[] from selected styles using preview images
    if (isDemoMode) {
      setStep("generate");
      setGenerating(true);
      try {
        const demoImages = generateDemoImages();
        setGeneratedImages(demoImages);
        setTimeout(() => onGenerationComplete(demoImages), 500);
      } finally {
        setGenerating(false);
      }
      return;
    }

    if (selectedStyles.length === 0 || uploadedUrls.length === 0) return;

    setGenerating(true);
    setStep("generate");
    setError(null);
    setGeneratedImages([]);

    try {
      // PHASE 1: Generate character sheet
      setGenerationPhase("character-sheet");
      setCurrentGenerating(null);

      const sheetResponse = await fetch("/api/generate-character-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          imageUrl: uploadedUrls[0], // Use best/first image
        }),
      });

      if (!sheetResponse.ok) {
        throw new Error("Failed to generate character sheet");
      }

      const sheetData = await sheetResponse.json();
      setCharacterSheetUrl(sheetData.characterSheetUrl);
      setCharacterSheetBase64(sheetData.characterSheetBase64);

      // PHASE 2: Generate headshots with identity lock
      setGenerationPhase("generating");

      // Build generation queue from SelectedStyles (with custom outfit/location/lighting)
      const queue: { style: SelectedStyle; variant: number }[] = [];
      for (const style of selectedStyles) {
        for (let v = 1; v <= style.quantity; v++) {
          queue.push({ style, variant: v });
        }
      }

      // Process queue
      for (const { style, variant } of queue) {
        setCurrentGenerating(style.id);
        setCurrentVariant(variant);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

          const response = await fetch("/api/generate-headshot-v2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              imageUrl: uploadedUrls[0],
              characterSheetUrl: sheetData.characterSheetUrl,
              characterSheetBase64: sheetData.characterSheetBase64,
              styleId: style.id,
              variant,
              gender: detectedGender,
              // Pass custom style configuration
              customOutfit: style.outfit,
              customLocation: style.location,
              customLighting: style.lighting,
              isCustomStyle: style.isCustom,
              customPrompt: style.customPrompt,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error(`Failed to generate ${style.id} v${variant}`);
            continue;
          }

          const data = await response.json();
          if (data.success && data.image) {
            setGeneratedImages((prev) => [...prev, data.image]);
          }
        } catch (fetchError) {
          console.error(`Error generating ${style.id} v${variant}:`, fetchError);
          continue;
        }
      }

      setCurrentGenerating(null);
      setGenerationPhase("idle");

      // Complete
      setGeneratedImages((current) => {
        if (current.length > 0) {
          setTimeout(() => onGenerationComplete(current), 500);
        } else {
          setError("No images were generated. Please try again.");
          onError("No images were generated");
        }
        return current;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      onError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
      setGenerationPhase("idle");
    }
  };

  // Helper to get style info from preset or selected styles
  const getStyleInfo = (styleId: string) => {
    // First check if it's a selected custom style
    const selectedStyle = selectedStyles.find(s => s.id === styleId);
    if (selectedStyle?.isCustom) {
      return { name: "Custom", desc: selectedStyle.customPrompt || "", preview: "✨" };
    }
    // Otherwise find in presets
    const preset = PRESET_STYLES.find(p => p.id === styleId);
    if (preset) {
      return { name: preset.name, desc: `${preset.outfit}`, preview: preset.previewEmoji };
    }
    return { name: styleId, desc: "", preview: "📷" };
  };

  // Tier styling
  const tierGradient = isPremium
    ? "from-amber-500 to-brand-600"
    : isStandard
    ? "from-brand-500 to-brand-600"
    : "from-brand-400 to-brand-600";

  const tierBg = isPremium
    ? "bg-gradient-to-br from-amber-50 to-brand-50 border-amber-200"
    : isStandard
    ? "bg-gradient-to-br from-brand-50 to-warm-50 border-brand-200"
    : "bg-gradient-to-br from-brand-50 to-warm-50 border-brand-200";

  return (
    <div className="min-h-screen bg-white">
      {/* App header — minimal, focused on the workflow */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-brand-100/50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo — links home */}
          <a href="/" className="flex items-center gap-2">
            <img src="/logo/logo-white-on-orange.png" alt="iHeadshot" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-gray-900">iHeadshot</span>
          </a>

          {/* Step progress — centered */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Step 1 */}
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${step === "upload" ? "bg-brand-600 text-white" : "bg-green-500 text-white"}`}>
                {step === "upload" ? "1" : "✓"}
              </div>
              <span className={`hidden sm:inline text-xs font-medium ${step === "upload" ? "text-brand-700" : "text-green-600"}`}>Upload</span>
            </div>

            <div className={`w-6 sm:w-10 h-0.5 rounded ${(step === "select" || step === "generate") ? "bg-green-400" : "bg-gray-200"}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${step === "select" ? "bg-brand-600 text-white" : step === "generate" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step === "generate" ? "✓" : "2"}
              </div>
              <span className={`hidden sm:inline text-xs font-medium ${step === "select" ? "text-brand-700" : step === "generate" ? "text-green-600" : "text-gray-400"}`}>Styles</span>
            </div>

            <div className={`w-6 sm:w-10 h-0.5 rounded ${step === "generate" ? "bg-green-400" : "bg-gray-200"}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${step === "generate" ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                3
              </div>
              <span className={`hidden sm:inline text-xs font-medium ${step === "generate" ? "text-brand-700" : "text-gray-400"}`}>Results</span>
            </div>
          </div>

          {/* Help link */}
          <a href="/#faq" className="text-xs text-gray-400 hover:text-brand-600 transition-colors">
            Need help?
          </a>
        </div>
      </nav>

      {/* STEP 1: Upload - Gender selection for demo, file upload for real */}
      {step === "upload" && (
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Photos</h1>
              <p className="text-gray-600">Upload 1–5 clear, front-facing photos for best results</p>
            </div>

            {isDemoMode ? (
              // Demo mode: Gender selection cards
              <div className="space-y-6">
                <p className="text-center text-gray-600 font-medium">Select your gender to view demo styles:</p>
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <button
                    onClick={() => setDetectedGender("male")}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                      detectedGender === "male"
                        ? "border-brand-600 bg-brand-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">👨</div>
                    <p className="font-semibold text-gray-900">Male</p>
                  </button>
                  <button
                    onClick={() => setDetectedGender("female")}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                      detectedGender === "female"
                        ? "border-brand-600 bg-brand-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">👩</div>
                    <p className="font-semibold text-gray-900">Female</p>
                  </button>
                </div>

                <Button
                  onClick={() => {
                    setStep("select");
                    setSelectedStyles([]);
                  }}
                  size="lg"
                  className="w-full py-6 text-lg bg-brand-600 hover:bg-brand-700 text-white cursor-pointer rounded-xl"
                >
                  Continue to Styles <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            ) : (
              // Real mode: File upload
              <div className="space-y-6">
                {files.length === 0 ? (
                  <div className="space-y-4">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                        isDragActive ? "border-brand-600 bg-brand-50" : "border-gray-300 hover:border-brand-400 hover:bg-gray-50"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        {isDragActive ? "Drop your photos here" : "Drag & drop your photos here"}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">or click to browse • up to 5 photos</p>
                    </div>

                    <Button
                      {...getRootProps()}
                      asChild
                      className="w-full py-6 text-base bg-brand-600 hover:bg-brand-700 text-white cursor-pointer rounded-xl"
                    >
                      <label>
                        <input {...getInputProps()} style={{ display: "none" }} />
                        Choose Photos
                      </label>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Photo grid */}
                    <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                      {files.map((file, index) => (
                        <div key={file.name} className="relative group">
                          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md border-2 border-green-400">
                            <img src={file.preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {files.length < 5 && (
                        <div
                          {...getRootProps()}
                          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-400 flex flex-col items-center justify-center cursor-pointer transition-colors"
                        >
                          <input {...getInputProps()} />
                          <Upload className="h-5 w-5 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-400">Add</span>
                        </div>
                      )}
                    </div>
                    <p className="text-center text-sm text-green-600 font-medium">
                      {files.length} photo{files.length !== 1 ? "s" : ""} selected
                      <span className="text-gray-400 font-normal"> • {5 - files.length} more allowed</span>
                    </p>
                  </div>
                )}

                {/* Photo tips */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Good lighting</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Face visible</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Neutral expression</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Avoid heavy filters</span>
                  </div>
                </div>

                {/* Sticky bottom bar */}
                {files.length > 0 && (
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
                    <div className="max-w-2xl mx-auto flex items-center gap-4">
                      <div className="flex gap-2">
                        {files.slice(0, 3).map((file, i) => (
                          <div key={file.name} className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                            <img src={file.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {files.length > 3 && (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-500">+{files.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={handleUploadComplete}
                        disabled={uploading}
                        className="flex-1 py-6 text-base bg-brand-600 hover:bg-brand-700 text-white cursor-pointer rounded-xl"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Uploading {files.length} photo{files.length !== 1 ? "s" : ""}...
                          </>
                        ) : (
                          <>
                            Continue with {files.length} photo{files.length !== 1 ? "s" : ""} <ChevronRight className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Select Styles - 2/3 + 1/3 grid layout */}
      {step === "select" && (
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8">
            {/* Left 2/3: StyleSelector */}
            <div className="col-span-2">
              <StyleSelector
                maxStyles={totalImages}
                selectedStyles={selectedStyles}
                onStylesChange={setSelectedStyles}
                gender={detectedGender}
              />
            </div>

            {/* Right 1/3: Sticky sidebar */}
            <div className="sticky top-20 h-fit space-y-6">
              {/* Your Photos section */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Photos <span className="text-gray-400 font-normal text-sm">{files.length}/5</span></h3>
                {files.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {files.map((file, i) => (
                        <div key={file.name} className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                          <img src={file.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep("upload")}
                      className="text-sm text-brand-700 hover:text-brand-800 font-medium"
                    >
                      Change photos
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Gender toggle */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Gender</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDetectedGender("male")}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                      detectedGender === "male"
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setDetectedGender("female")}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                      detectedGender === "female"
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Selected Styles */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Selected Styles <span className="text-gray-500 font-normal">{selectedStyles.length} / {totalImages}</span>
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {selectedStyles.map((style) => (
                    <div key={style.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-200 hover:border-brand-400 transition-colors group cursor-pointer">
                      <img
                        src={getPreviewImagePath(style.id, detectedGender)}
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate button card */}
              <div className="bg-gray-900 text-white rounded-2xl p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400">ORDER SUMMARY</p>
                  <h4 className="text-lg font-bold">{tier.charAt(0).toUpperCase() + tier.slice(1)} Package</h4>
                  <p className="text-sm text-gray-400">{selectedStyles.length} styles selected</p>
                </div>

                <Button
                  onClick={generateHeadshots}
                  disabled={selectedStyles.length === 0}
                  className="w-full py-6 bg-white text-gray-900 hover:bg-gray-100 font-semibold rounded-xl cursor-pointer"
                >
                  {isDemoMode ? "View Demo Results" : "Generate Headshots"}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-800">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Powered by AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Generation - Results grid */}
      {step === "generate" && (
        <div className="px-6 py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Your Headshots</h1>
              <p className="text-gray-600">{generatedImages.length} professional styles ready to download</p>
            </div>

            {/* Phase indicator during generation */}
            {generating && generationPhase !== "idle" && (
              <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">
                    {generationPhase === "character-sheet" ? "🔍 Analyzing your face..." : "✨ Creating headshots..."}
                  </span>
                  <span className="text-sm text-gray-600">{generatedImages.length} / {selectedStyles.length}</span>
                </div>
                <Progress
                  value={generationPhase === "character-sheet" ? 5 : (generatedImages.length / selectedStyles.length) * 100}
                  className="h-2"
                />
                {currentGenerating && (
                  <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating: {getStyleInfo(currentGenerating).name}
                  </p>
                )}
              </div>
            )}

            {/* Download All button */}
            {generatedImages.length > 0 && !generating && (
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl cursor-pointer flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download All
              </Button>
            )}

            {/* Generated images grid */}
            {generatedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {generatedImages.map((image) => (
                  <div key={image.id} className="group">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-lg mb-3">
                      <img src={image.imageUrl} alt={image.styleName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Button className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-opacity cursor-pointer">
                          <Download className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{image.styleName}</p>
                    <p className="text-xs text-gray-500">HD Quality</p>
                  </div>
                ))}
                {currentGenerating && (
                  <div className="aspect-[3/4] rounded-2xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 shadow-lg">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                    <p className="text-xs text-gray-500 text-center px-2">Generating...</p>
                  </div>
                )}
              </div>
            )}

            {/* Initial loading state */}
            {generating && generatedImages.length === 0 && generationPhase === "character-sheet" && (
              <div className="text-center py-20">
                <Loader2 className="h-12 w-12 text-brand-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Analyzing your photo...</p>
              </div>
            )}

            {generating && generatedImages.length === 0 && generationPhase === "generating" && (
              <div className="text-center py-20">
                <Loader2 className="h-12 w-12 text-brand-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Creating your headshots...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed bottom-6 left-6 right-6 max-w-md flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
