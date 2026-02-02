"use client";

import { useState } from "react";
import { PricingCard } from "@/components/PricingCard";
import { PRICING_TIERS, type PricingTier } from "@/lib/pricing-config";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Clock } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectTier = async (tier: string) => {
    setLoading(tier);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Simple Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Package
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            One-time payment. No subscription. Get professional headshots in
            minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {(Object.keys(PRICING_TIERS) as PricingTier[]).map((tier) => {
            const config = PRICING_TIERS[tier];
            return (
              <PricingCard
                key={tier}
                name={config.name}
                price={config.price}
                headshots={config.headshots}
                features={[...config.features]}
                popular={"popular" in config && config.popular}
                tier={tier}
                onSelect={handleSelectTier}
                loading={loading === tier}
              />
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Satisfaction Guarantee
            </h3>
            <p className="text-sm text-gray-600">
              Not happy? We'll regenerate or refund you.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Instant Processing
            </h3>
            <p className="text-sm text-gray-600">
              Start immediately after payment.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Ready in 30 Minutes
            </h3>
            <p className="text-sm text-gray-600">
              From upload to download, fast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
