"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

interface ProcessingStatusProps {
  orderId: string;
  initialStatus?: string;
}

interface StatusData {
  status: string;
  progress?: number;
  message?: string;
  imageCount?: number;
  estimatedTime?: string;
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    label: "Pending",
    message: "Waiting to start processing...",
  },
  paid: {
    icon: Clock,
    color: "text-brand-500",
    bgColor: "bg-brand-100",
    label: "Paid",
    message: "Payment received! Waiting for photo upload...",
  },
  training: {
    icon: Loader2,
    color: "text-brand-600",
    bgColor: "bg-brand-100",
    label: "Training AI",
    message: "Our AI is learning your unique features...",
  },
  generating: {
    icon: Sparkles,
    color: "text-brand-600",
    bgColor: "bg-brand-100",
    label: "Generating",
    message: "Creating your professional headshots...",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "Complete",
    message: "Your headshots are ready!",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Failed",
    message: "Something went wrong. We're looking into it.",
  },
};

export function ProcessingStatus({ orderId, initialStatus = "pending" }: ProcessingStatusProps) {
  const [status, setStatus] = useState<StatusData>({
    status: initialStatus,
    progress: 0,
  });
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!isPolling) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/status/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);

          // Stop polling if completed or failed
          if (data.status === "completed" || data.status === "failed") {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error("Failed to check status:", error);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 5 seconds
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [orderId, isPolling]);

  const config = STATUS_CONFIG[status.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const IconComponent = config.icon;
  const isAnimated = status.status === "training" || status.status === "generating";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.bgColor} mb-6`}
        >
          <IconComponent
            className={`w-10 h-10 ${config.color} ${isAnimated ? "animate-spin" : ""}`}
          />
        </div>

        <Badge variant="secondary" className="mb-4">
          {config.label}
        </Badge>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {status.status === "completed"
            ? "Your Headshots Are Ready!"
            : status.status === "failed"
            ? "Processing Failed"
            : "Processing Your Photos"}
        </h2>

        <p className="text-gray-600 max-w-md mx-auto">
          {status.message || config.message}
        </p>
      </div>

      {(status.status === "training" || status.status === "generating") && (
        <div className="max-w-md mx-auto space-y-2">
          <Progress value={status.progress || 0} className="h-3" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{Math.round(status.progress || 0)}% complete</span>
            {status.estimatedTime && <span>~{status.estimatedTime} remaining</span>}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">What's happening:</h3>
        <div className="space-y-4">
          <StatusStep
            step={1}
            label="Photos uploaded"
            active={false}
            completed={["training", "generating", "completed"].includes(status.status)}
          />
          <StatusStep
            step={2}
            label="AI learning your features"
            active={status.status === "training"}
            completed={["generating", "completed"].includes(status.status)}
          />
          <StatusStep
            step={3}
            label="Generating headshots"
            active={status.status === "generating"}
            completed={status.status === "completed"}
          />
          <StatusStep
            step={4}
            label="Ready to download"
            active={false}
            completed={status.status === "completed"}
          />
        </div>
      </div>

      {status.status === "completed" && (
        <div className="text-center">
          <Button asChild size="lg">
            <Link href={`/gallery/${orderId}`}>
              View Your Headshots ({status.imageCount || 0} photos)
            </Link>
          </Button>
        </div>
      )}

      {status.status === "failed" && (
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            We apologize for the inconvenience. Our team has been notified and
            will either retry your order or reach out to you directly.
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:support@headshotai.com">Contact Support</a>
          </Button>
        </div>
      )}

      <p className="text-center text-sm text-gray-500">
        Order ID: {orderId}
      </p>
    </div>
  );
}

function StatusStep({
  step,
  label,
  active,
  completed,
}: {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
          ${
            completed
              ? "bg-green-600 text-white"
              : active
              ? "bg-brand-600 text-white"
              : "bg-gray-200 text-gray-500"
          }
        `}
      >
        {completed ? <CheckCircle2 className="w-5 h-5" /> : step}
      </div>
      <span
        className={`text-sm ${
          completed ? "text-green-700 font-medium" : active ? "text-brand-700 font-medium" : "text-gray-500"
        }`}
      >
        {label}
      </span>
      {active && <Loader2 className="w-4 h-4 text-brand-600 animate-spin ml-auto" />}
    </div>
  );
}
