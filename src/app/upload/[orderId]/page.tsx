"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/UploadDropzone";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function UploadPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const [order, setOrder] = useState<{ tier: string; headshot_count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState<"idle" | "uploaded" | "starting">("idle");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/status/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const handleFilesSelected = (files: File[]) => {
    console.log("Files selected:", files.length);
  };

  const handleFilesUploaded = async () => {
    // Show upload complete feedback
    setUploadState("uploaded");

    // Brief pause so user sees the success message
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show starting training state
    setUploadState("starting");

    try {
      const response = await fetch("/api/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start training");
      }

      router.push(`/processing/${orderId}`);
    } catch (error) {
      console.error("Training error:", error);
      setUploadState("idle");
      alert("Failed to start processing. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show success state when photos are uploaded or training is starting
  if (uploadState === "uploaded" || uploadState === "starting") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {uploadState === "uploaded" ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Photos Uploaded Successfully!
                </h2>
                <p className="text-gray-600">
                  All your photos have been securely uploaded.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Starting AI Training...
                </h2>
                <p className="text-gray-600">
                  We're initializing the AI to learn your unique features.
                  This will only take a moment.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Step 1 of 3
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upload Your Photos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload 10-20 photos of yourself. We'll use these to train the AI to
            generate headshots that look like you.
          </p>
          {order && (
            <p className="mt-4 text-sm text-gray-500">
              {order.tier.charAt(0).toUpperCase() + order.tier.slice(1)} Package
              — {order.headshot_count} headshots
            </p>
          )}
        </div>

        <Card className="p-6 md:p-8">
          <UploadDropzone
            orderId={orderId}
            onFilesSelected={handleFilesSelected}
            onFilesUploaded={handleFilesUploaded}
            minFiles={10}
            maxFiles={20}
          />
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Order ID: {orderId}
        </p>
      </div>
    </div>
  );
}
