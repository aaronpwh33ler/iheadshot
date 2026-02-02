"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/UploadDropzone";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UploadPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const [order, setOrder] = useState<{ tier: string; headshot_count: number } | null>(null);
  const [loading, setLoading] = useState(true);

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
