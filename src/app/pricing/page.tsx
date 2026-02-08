"use client";

import { useState } from "react";
import { PricingCard } from "@/components/PricingCard";
import { PRICING_TIERS, type PricingTier } from "@/lib/pricing-config";

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
    <div className="py-20 orange-section min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
            Simple Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Choose Your Package
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            One-time payment. No subscriptions. Keep your photos forever.
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
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Satisfaction Guarantee
            </h3>
            <p className="text-sm text-gray-600">
              Not happy? We&apos;ll regenerate or refund you.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              No Training Required
            </h3>
            <p className="text-sm text-gray-600">
              Upload one photo, get instant results.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Fast AI Generation
            </h3>
            <p className="text-sm text-gray-600">
              Results delivered in minutes, not days.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 bg-white border border-brand-200 rounded-full px-6 py-3 shadow-sm">
            <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-gray-700 font-medium">Secure payment via Stripe</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 text-sm">Cancel anytime during checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
