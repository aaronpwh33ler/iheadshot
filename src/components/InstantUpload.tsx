"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Sparkles, AlertCircle, Loader2, CheckCircle2, Image as ImageIcon, AlertTriangle, Crown, ChevronRight, ChevronLeft, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StyleSelector, SelectedStyle, PRESET_STYLES } from "./StyleSelector";

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
        const { signedUrl, publicUrl } = await urlResponse.json();

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
    // Demo mode: skip generation, load existing images
    if (isDemoMode) {
      setStep("generate");
      setLoadingDemoImages(true);
      await loadDemoImages();
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
    ? "from-amber-500 to-orange-600"
    : isStandard
    ? "from-purple-500 to-blue-600"
    : "from-blue-500 to-purple-600";

  const tierBg = isPremium
    ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
    : isStandard
    ? "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
    : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200";

  return (
    <div className="space-y-6">
      {/* Global Header: Tier badge + Step indicator */}
      <div className="text-center space-y-4">
        <Badge className={`bg-gradient-to-r ${tierGradient} text-white border-0 px-4 py-1.5 text-sm`}>
          {isPremium && <Crown className="h-3.5 w-3.5 mr-1.5" />}
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Package — {totalImages} Headshots
        </Badge>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className={`flex items-center gap-1.5 ${step === "upload" ? "text-blue-600 font-medium" : "text-gray-400"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step === "upload" ? "bg-blue-600 text-white" : "bg-green-500 text-white"}`}>
              {step === "upload" ? "1" : "✓"}
            </span>
            Upload
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <div className={`flex items-center gap-1.5 ${step === "select" ? "text-blue-600 font-medium" : "text-gray-400"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step === "select" ? "bg-blue-600 text-white" : step === "generate" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
              {step === "generate" ? "✓" : "2"}
            </span>
            Choose Styles
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <div className={`flex items-center gap-1.5 ${step === "generate" ? "text-blue-600 font-medium" : "text-gray-400"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step === "generate" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>3</span>
            Generate
          </div>
        </div>
      </div>

      {/* STEP 1: Upload - Narrow card */}
      {step === "upload" && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {files.length === 0 ? (
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}
                >
                  <input {...getInputProps()} />
                  <div className={`w-20 h-20 bg-gradient-to-br ${tierGradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">
                    {isDragActive ? "Drop your photos here" : "Upload your photos"}
                  </p>
                  <p className="text-gray-500 mb-4">1-5 photos for best results</p>
                  <p className="text-sm text-gray-400">JPG, PNG, or WebP up to 10MB each</p>
                </div>

                {/* Demo mode: Skip button */}
                {isDemoMode && (
                  <Button onClick={handleUploadComplete} size="lg" className={`w-full py-6 text-lg bg-gradient-to-r ${tierGradient} hover:opacity-90 cursor-pointer`}>
                    Skip to Styles (Demo Mode)<ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {overLimitWarning && (
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-sm">Maximum 5 photos allowed.</p>
                    <button onClick={() => setOverLimitWarning(false)} className="ml-auto"><X className="h-4 w-4" /></button>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 justify-center">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                        <img src={file.preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      {!uploading && (
                        <button onClick={() => removeFile(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 opacity-0 group-hover:opacity-100">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {files.length < 5 && !uploading && (
                    <div {...getRootProps()} className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gray-50">
                      <input {...getInputProps()} />
                      <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">Add more</span>
                    </div>
                  )}
                </div>

                <div className="text-center text-sm text-gray-600">
                  <span className="font-medium">{files.length}</span> photo{files.length !== 1 ? "s" : ""} selected
                  {files.length >= 3 && <span className="text-green-600 ml-2 inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Great!</span>}
                </div>

                <Button onClick={handleUploadComplete} disabled={uploading} size="lg" className={`w-full py-6 text-lg bg-gradient-to-r ${tierGradient} hover:opacity-90 cursor-pointer`}>
                  {uploading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Uploading...</> : <>Continue to Style Selection<ChevronRight className="h-5 w-5 ml-2" /></>}
                </Button>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">For best results:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-green-700"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Clear, well-lit face</p>
                <p className="flex items-center gap-2 text-green-700"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Front-facing or slight angle</p>
                <p className="flex items-center gap-2 text-green-700"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Multiple photos (2-5 best)</p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-red-600"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>No sunglasses</p>
                <p className="flex items-center gap-2 text-red-600"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>No heavy filters</p>
                <p className="flex items-center gap-2 text-red-600"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>No group photos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Select Styles - Full width for style cards */}
      {step === "select" && (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Headshot Styles</h2>
            <p className="text-gray-600">
              Select styles and customize outfits, locations, and lighting.
            </p>
          </div>

          {/* Gender toggle */}
          {!isDemoMode && (
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-gray-500">Showing styles for:</span>
              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setDetectedGender("male")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    detectedGender === "male"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setDetectedGender("female")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    detectedGender === "female"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          )}

          {/* StyleSelector - no scroll container, let it flow */}
          <StyleSelector
            totalImages={totalImages}
            selectedStyles={selectedStyles}
            onStylesChange={setSelectedStyles}
            gender={detectedGender}
          />

          {/* Action buttons */}
          <div className="flex gap-3 max-w-xl mx-auto">
            <Button variant="outline" onClick={() => setStep("upload")} className="flex-1 cursor-pointer">
              <ChevronLeft className="h-4 w-4 mr-1" />Back
            </Button>
            <Button
              onClick={generateHeadshots}
              disabled={!isDemoMode && (selectedStyles.length === 0 || getAllocatedImages() === 0)}
              size="lg"
              className={`flex-[2] py-6 bg-gradient-to-r ${tierGradient} hover:opacity-90 cursor-pointer`}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isDemoMode ? "View Demo Results" : `Generate ${getAllocatedImages()} Headshots`}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Generation - Medium width */}
      {step === "generate" && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Phase indicator */}
          <div className={`p-4 rounded-xl border ${tierBg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">
                {generationPhase === "character-sheet" ? "🔍 Analyzing your face..." : generationPhase === "generating" ? "✨ Creating headshots..." : generating ? "Processing..." : "Generation complete!"}
              </span>
              <span className="text-sm text-gray-600">{generatedImages.length} / {totalImages}</span>
            </div>
            <Progress value={generationPhase === "character-sheet" ? 5 : (generatedImages.length / totalImages) * 100} className="h-2" />

            {generationPhase === "character-sheet" && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 flex items-center gap-2">
                  <Wand2 className="h-4 w-4 animate-pulse" />
                  <strong>Creating identity profile...</strong> This captures your face from multiple angles for perfect consistency.
                </p>
              </div>
            )}

            {currentGenerating && generationPhase === "generating" && (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating: {getStyleInfo(currentGenerating).preview} {getStyleInfo(currentGenerating).name} {currentVariant > 1 ? `#${currentVariant}` : ""}
              </p>
            )}
          </div>

          {/* Character sheet preview */}
          {characterSheetUrl && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
              <p className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Identity profile created
              </p>
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-white shadow-md mx-auto">
                <img src={characterSheetUrl} alt="Character sheet" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Generated images grid */}
          {generatedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="relative group animate-fade-in">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                    <img src={image.imageUrl} alt={image.styleName} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                    <p className="text-white text-sm font-medium">{image.styleName}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
              ))}
              {currentGenerating && (
                <div className="aspect-[3/4] rounded-xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                  <p className="text-2xl mb-1">{getStyleInfo(currentGenerating).preview}</p>
                  <p className="text-xs text-gray-500 text-center px-2">{getStyleInfo(currentGenerating).name}{currentVariant > 1 ? ` #${currentVariant}` : ""}</p>
                </div>
              )}
            </div>
          )}

          {generating && generatedImages.length === 0 && generationPhase !== "character-sheet" && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Starting generation...</p>
            </div>
          )}

          {/* Demo mode loading */}
          {loadingDemoImages && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading demo images...</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
