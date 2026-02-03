"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Sparkles, AlertCircle, Loader2, CheckCircle2, Image as ImageIcon, AlertTriangle, Crown, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
}

interface FileWithPreview extends File {
  preview: string;
}

// Style categories for better organization
const STYLE_CATEGORIES = [
  {
    name: "Corporate",
    description: "Traditional business looks",
    styles: [
      { id: "corporate-navy", name: "Navy Suit", desc: "Classic navy suit, white background" },
      { id: "corporate-gray", name: "Gray Suit", desc: "Charcoal gray suit, professional" },
      { id: "corporate-black", name: "Black Suit", desc: "Executive black suit, gradient bg" },
    ],
  },
  {
    name: "Business Casual",
    description: "Relaxed professional",
    styles: [
      { id: "business-casual-blue", name: "Blue Shirt", desc: "Light blue button-up, approachable" },
      { id: "business-casual-white", name: "White Shirt", desc: "Crisp white shirt, open collar" },
      { id: "business-casual-polo", name: "Smart Casual", desc: "Navy polo, friendly look" },
    ],
  },
  {
    name: "Creative",
    description: "Modern & artistic",
    styles: [
      { id: "creative-turtleneck", name: "Turtleneck", desc: "Black turtleneck, designer aesthetic" },
      { id: "creative-modern", name: "Modern", desc: "Dark sweater, contemporary vibe" },
    ],
  },
  {
    name: "Outdoor",
    description: "Natural settings",
    styles: [
      { id: "outdoor-natural", name: "Natural Light", desc: "Golden hour, greenery background" },
      { id: "outdoor-urban", name: "Urban", desc: "City background, street style" },
    ],
  },
  {
    name: "Executive",
    description: "C-suite presence",
    styles: [
      { id: "executive-classic", name: "Classic Exec", desc: "CEO portrait style, authoritative" },
      { id: "executive-modern", name: "Modern Exec", desc: "Contemporary C-suite look" },
    ],
  },
  {
    name: "Tech Industry",
    description: "Silicon Valley style",
    styles: [
      { id: "tech-startup", name: "Startup", desc: "Casual hoodie, innovative vibe" },
      { id: "tech-professional", name: "Tech Pro", desc: "Casual button-up, modern tech" },
    ],
  },
  {
    name: "Professional Services",
    description: "Industry-specific",
    styles: [
      { id: "healthcare-professional", name: "Healthcare", desc: "Medical professional style" },
      { id: "academic", name: "Academic", desc: "Scholarly, library background" },
      { id: "sales-professional", name: "Sales", desc: "Warm, trustworthy presence" },
      { id: "finance-professional", name: "Finance", desc: "Conservative, confident" },
      { id: "legal-professional", name: "Legal", desc: "Authoritative, professional" },
      { id: "consultant", name: "Consultant", desc: "Knowledgeable, business setting" },
    ],
  },
];

type Step = "upload" | "select" | "generate";

export function InstantUpload({
  orderId,
  tier = "basic",
  headshotCount = 10,
  onGenerationComplete,
  onError,
}: InstantUploadProps) {
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentGenerating, setCurrentGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overLimitWarning, setOverLimitWarning] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const isPremium = tier === "premium";
  const isPro = tier === "pro";

  // Calculate max styles based on tier
  const maxStyles = isPremium ? 20 : isPro ? 20 : 10;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    const totalFiles = files.length + acceptedFiles.length;
    if (totalFiles > 5) {
      setOverLimitWarning(true);
      const remaining = 5 - files.length;
      acceptedFiles = acceptedFiles.slice(0, remaining);
    }

    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
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
    disabled: generating,
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

  const toggleStyle = (styleId: string) => {
    setSelectedStyles((prev) => {
      if (prev.includes(styleId)) {
        return prev.filter((id) => id !== styleId);
      }
      if (prev.length >= maxStyles) {
        return prev;
      }
      return [...prev, styleId];
    });
  };

  const selectAllInCategory = (categoryStyles: { id: string }[]) => {
    const styleIds = categoryStyles.map((s) => s.id);
    const allSelected = styleIds.every((id) => selectedStyles.includes(id));

    if (allSelected) {
      setSelectedStyles((prev) => prev.filter((id) => !styleIds.includes(id)));
    } else {
      const newStyles = styleIds.filter((id) => !selectedStyles.includes(id));
      const available = maxStyles - selectedStyles.length;
      setSelectedStyles((prev) => [...prev, ...newStyles.slice(0, available)]);
    }
  };

  // Upload photos and move to style selection
  const handleUploadComplete = async () => {
    setError(null);

    try {
      const urls: string[] = [];
      for (const file of files) {
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
        urls.push(url);
      }

      setUploadedUrls(urls);
      setStep("select");

      // Pre-select popular styles based on tier
      const defaultStyles = ["corporate-navy", "business-casual-blue", "creative-turtleneck", "outdoor-natural"];
      setSelectedStyles(defaultStyles.slice(0, Math.min(defaultStyles.length, maxStyles)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
    }
  };

  // Generate headshots one at a time
  const generateHeadshots = async () => {
    if (selectedStyles.length === 0) return;

    setGenerating(true);
    setStep("generate");
    setError(null);
    setGeneratedImages([]);

    try {
      for (const styleId of selectedStyles) {
        setCurrentGenerating(styleId);

        const response = await fetch("/api/generate-single", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            imageUrl: uploadedUrls[0],
            styleId,
            quality: isPremium ? "premium" : "standard",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to generate ${styleId}:`, errorData.error);
          continue;
        }

        const data = await response.json();

        if (data.success && data.image) {
          setGeneratedImages((prev) => [...prev, data.image]);
        }
      }

      setCurrentGenerating(null);

      // Get final list and complete
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
      const errorMessage = err instanceof Error ? err.message : "Generation failed";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  // Tier-specific styling
  const tierGradient = isPremium
    ? "from-amber-500 to-orange-600"
    : isPro
    ? "from-purple-500 to-blue-600"
    : "from-blue-500 to-purple-600";

  const tierBg = isPremium
    ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
    : isPro
    ? "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
    : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200";

  return (
    <div className="space-y-6">
      {/* Tier badge */}
      {(isPremium || isPro) && (
        <div className="text-center">
          <Badge className={`bg-gradient-to-r ${tierGradient} text-white border-0 px-4 py-1`}>
            {isPremium && <Crown className="h-3 w-3 mr-1" />}
            {isPremium ? "Premium Package" : "Pro Package"} — Up to {maxStyles} Headshots
          </Badge>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className={`flex items-center gap-1 ${step === "upload" ? "text-blue-600 font-medium" : "text-gray-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "upload" ? "bg-blue-600 text-white" : step === "select" || step === "generate" ? "bg-green-500 text-white" : "bg-gray-200"}`}>
            {step === "select" || step === "generate" ? "✓" : "1"}
          </span>
          Upload
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <div className={`flex items-center gap-1 ${step === "select" ? "text-blue-600 font-medium" : "text-gray-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "select" ? "bg-blue-600 text-white" : step === "generate" ? "bg-green-500 text-white" : "bg-gray-200"}`}>
            {step === "generate" ? "✓" : "2"}
          </span>
          Choose Styles
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <div className={`flex items-center gap-1 ${step === "generate" ? "text-blue-600 font-medium" : "text-gray-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "generate" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>3</span>
          Generate
        </div>
      </div>

      {/* STEP 1: Upload photos */}
      {step === "upload" && (
        <>
          {files.length === 0 ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                ${isDragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
              `}
            >
              <input {...getInputProps()} />
              <div className={`w-20 h-20 bg-gradient-to-br ${tierGradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
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
              {overLimitWarning && (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">Maximum 5 photos allowed.</p>
                  <button onClick={() => setOverLimitWarning(false)} className="ml-auto">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                      <img src={file.preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {files.length < 5 && (
                  <div
                    {...getRootProps()}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gray-50"
                  >
                    <input {...getInputProps()} />
                    <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Add more</span>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                <span className="font-medium">{files.length}</span> photo{files.length !== 1 ? "s" : ""} selected
                {files.length >= 3 && (
                  <span className="text-green-600 ml-2 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Great!
                  </span>
                )}
              </div>

              <Button
                onClick={handleUploadComplete}
                size="lg"
                className={`w-full py-6 text-lg bg-gradient-to-r ${tierGradient} hover:opacity-90`}
              >
                Continue to Style Selection
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* STEP 2: Select styles */}
      {step === "select" && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">
              Select up to <span className="font-bold text-blue-600">{maxStyles}</span> styles.{" "}
              <span className="font-medium">{selectedStyles.length}</span> selected.
            </p>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {STYLE_CATEGORIES.map((category) => (
              <div key={category.name} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                  <button
                    onClick={() => selectAllInCategory(category.styles)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {category.styles.every((s) => selectedStyles.includes(s.id)) ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {category.styles.map((style) => {
                    const isSelected = selectedStyles.includes(style.id);
                    const isDisabled = !isSelected && selectedStyles.length >= maxStyles;

                    return (
                      <button
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        disabled={isDisabled}
                        className={`
                          p-3 rounded-lg text-left transition-all border-2
                          ${isSelected
                            ? "border-blue-500 bg-blue-50"
                            : isDisabled
                            ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`font-medium text-sm ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                              {style.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{style.desc}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep("upload")}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={generateHeadshots}
              disabled={selectedStyles.length === 0}
              size="lg"
              className={`flex-[2] py-6 bg-gradient-to-r ${tierGradient} hover:opacity-90`}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Generate {selectedStyles.length} Headshots
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Generation progress with progressive images */}
      {step === "generate" && (
        <div className="space-y-6">
          {/* Progress header */}
          <div className={`p-4 rounded-xl border ${tierBg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">
                {generating ? "Creating your headshots..." : "Generation complete!"}
              </span>
              <span className="text-sm text-gray-600">
                {generatedImages.length} / {selectedStyles.length}
              </span>
            </div>
            <Progress value={(generatedImages.length / selectedStyles.length) * 100} className="h-2" />

            {currentGenerating && (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating: {STYLE_CATEGORIES.flatMap(c => c.styles).find(s => s.id === currentGenerating)?.name || currentGenerating}
              </p>
            )}
          </div>

          {/* Generated images grid - shows as they complete */}
          {generatedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {generatedImages.map((image, index) => (
                <div key={image.id} className="relative group animate-fade-in">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                    <img
                      src={image.imageUrl}
                      alt={image.styleName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                    <p className="text-white text-sm font-medium">{image.styleName}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
              ))}

              {/* Placeholder for currently generating */}
              {currentGenerating && (
                <div className="aspect-[3/4] rounded-xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                  <p className="text-xs text-gray-500 text-center px-2">
                    {STYLE_CATEGORIES.flatMap(c => c.styles).find(s => s.id === currentGenerating)?.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Waiting message */}
          {generating && generatedImages.length === 0 && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Starting generation...</p>
              <p className="text-sm text-gray-400 mt-1">Images will appear as they&apos;re created</p>
            </div>
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

      {/* Photo tips - only show on upload step */}
      {step === "upload" && (
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
      )}
    </div>
  );
}
